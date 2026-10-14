import { useState, useEffect, useRef, useMemo } from "react";
import { io } from "socket.io-client";
import { useSpotify } from "../../context/SpotifyContext";
import { BACKEND_URL } from "../../lib/config";
import { api } from "./inboxApi";

export function useInbox() {
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
            if (conversationIdRef.current === id) {
                setMessages((prev) => {
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

    const handleBack = () => {
        setConversationId(null);
        setOtherUser(null);
        setMessages([]);
        conversationIdRef.current = null;
    };

    return {
        currentUser, conversationId, handleSelectConversation, updatePreviewRef,
        unreadUpdateRef, handleBack, otherUser, messages, setMessages,
        handleMessageSent,
    };
}