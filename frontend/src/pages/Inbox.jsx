import { useState, useEffect, useRef, useMemo } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useSpotify } from "../context/SpotifyContext";
import ConversationList from "../components/inbox/ConversationList";
import ChatPanel from "../components/inbox/ChatPanel";
import { BACKEND_URL, API_URL } from "../lib/config";

const api = axios.create({ baseURL: API_URL });

function Inbox() {
    const { userProfile } = useSpotify();

    const [socket, setSocket] = useState(null);
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [otherUser, setOtherUser] = useState(null);
    const conversationIdRef = useRef(null);
    const currentUserRef = useRef(null);
    const updatePreviewRef = useRef(null);
    const unreadUpdateRef = useRef(null);

    const currentUser = useMemo(() => {
        if (!userProfile) return null;
        return {
            id: userProfile.id,
            displayName: userProfile.display_name,
            email: userProfile.email,
            profileImage: userProfile.images?.[0]?.url ?? null,
        };
    }, [userProfile]);

    useEffect(() => {
        currentUserRef.current = currentUser;
    }, [currentUser]);

    useEffect(() => {
        const s = io(BACKEND_URL, { transports: ["websocket"] });

        const rejoinRooms = () => {
            const userId = currentUserRef.current?.id;
            if (userId) s.emit("join-user-room", { userId });
            const activeConvId = conversationIdRef.current;
            if (activeConvId) s.emit("join-conversation", { conversationId: activeConvId });
        };

        const handleNewMessage = (message) => {
            // ignore events for conversations the user isn't currently viewing
            if (message?.conversationId && message.conversationId !== conversationIdRef.current) return;

            setMessages((prev) => {
                const optimisticIndex = prev.findIndex(
                    (msg) =>
                        String(msg.id ?? "").startsWith("optimistic-") &&
                        msg.text === message.text &&
                        msg.senderId === message.senderId
                );
                if (optimisticIndex !== -1) {
                    const updated = [...prev];
                    updated[optimisticIndex] = {
                        ...message,
                        createdAt: message.createdAt ?? prev[optimisticIndex].createdAt,
                    };
                    return updated;
                }
                if (prev.some((msg) => msg.id === message.id)) return prev;
                return [...prev, message];
            });
        };

        const handleUnreadUpdate = (payload) => {
            unreadUpdateRef.current?.(payload);
        };

        s.on("connect", rejoinRooms);
        s.on("reconnect", rejoinRooms);
        s.on("new-message", handleNewMessage);
        s.on("unread-update", handleUnreadUpdate);

        setSocket(s);

        return () => {
            s.off("connect", rejoinRooms);
            s.off("reconnect", rejoinRooms);
            s.off("new-message", handleNewMessage);
            s.off("unread-update", handleUnreadUpdate);
            s.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!socket || !currentUser?.id) return;
        socket.emit("join-user-room", { userId: currentUser.id });
    }, [socket, currentUser?.id]);

    const handleMessageSent = ({ conversationId: sentConvId, lastMessage, lastSenderId }) => {
        if (updatePreviewRef.current) {
            updatePreviewRef.current({ conversationId: sentConvId, lastMessage, lastSenderId });
        }
    };

    const handleSelectConversation = async (id, selectedOtherUser) => {
        if (conversationIdRef.current && conversationIdRef.current !== id) {
            socket?.emit("leave-conversation", { conversationId: conversationIdRef.current });
        }
        socket?.emit("join-conversation", { conversationId: id });
        conversationIdRef.current = id;
        setOtherUser(selectedOtherUser ?? null);
        setMessages([]);
        setConversationId(id);

        try {
            const res = await api.get(`/conversations/${id}/messages`);
            // make sure the user hasn't switched again while we were loading
            if (conversationIdRef.current === id) {
                setMessages((prev) => {
                    // preserve any optimistic / socket messages that arrived during the fetch
                    const fetched = res.data ?? [];
                    const fetchedIds = new Set(fetched.map((m) => m.id));
                    const liveExtras = prev.filter((m) => !fetchedIds.has(m.id));
                    return [...fetched, ...liveExtras];
                });
            }
        } catch (err) {
            console.error("Error loading messages:", err);
        }
    };

    if (!currentUser) return (
        <div className="flex items-center justify-center h-screen text-[var(--accent-secondary)]">
            <p>Please log in to use inbox.</p>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-[var(--bg-primary)] overflow-hidden">
            <div className="flex flex-1 min-h-0 overflow-hidden">
                <ConversationList
                    currentUser={currentUser}
                    conversationId={conversationId}
                    onSelectConversation={handleSelectConversation}
                    updatePreviewRef={updatePreviewRef}
                    unreadUpdateRef={unreadUpdateRef}
                />

                <div className="flex-1 border-l border-[var(--accent-secondary)]/30">
                    {conversationId ? (
                        <ChatPanel
                            currentUser={currentUser}
                            conversationId={conversationId}
                            otherUser={otherUser}
                            messages={messages}
                            setMessages={setMessages}
                            onMessageSent={handleMessageSent}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--accent-secondary)]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="text-lg text-[var(--text-primary)]">Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Inbox;
