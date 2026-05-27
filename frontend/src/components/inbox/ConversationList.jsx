import { useState, useEffect, useRef } from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { Pencil2Icon } from "@radix-ui/react-icons";
import axios from "axios";
import ConversationItem from "./ConversationItem";
import NewConversationModal from "./NewConversationModal";

const api = axios.create({ baseURL: "http://127.0.0.1:5001/api" });

function ConversationList({ currentUser, conversationId, onSelectConversation, socketRef, updatePreviewRef }) {
    const [conversations, setConversations] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const activeConversationIdRef = useRef(null);

    if (updatePreviewRef) {
        updatePreviewRef.current = ({ conversationId: updatedId, lastMessage, lastSenderId }) => {
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.id === updatedId
                        ? {
                            ...conv,
                            lastMessage,
                            lastSenderId,
                            timestampOfLastMessage: { _seconds: Math.floor(Date.now() / 1000) },
                          }
                        : conv
                )
            );
        };
    }

    const userMap = Object.fromEntries(allUsers.map((user) => [user.id, user]));

    const sortedConversations = [...conversations]
        .filter((conv) => {
            if (!conv.lastMessage || conv.lastMessage.trim() === "") return false;
            const otherId = conv.participants?.find((participantId) => participantId !== currentUser.id);
            return !!userMap[otherId];
        })
        .sort((convA, convB) => {
            const timeA = convA.timestampOfLastMessage?.seconds ?? convA.timestampOfLastMessage?._seconds ?? 0;
            const timeB = convB.timestampOfLastMessage?.seconds ?? convB.timestampOfLastMessage?._seconds ?? 0;
            return timeB - timeA;
        });

    useEffect(() => {
        if (!currentUser?.id) return;
        api.get(`/conversations/inbox/${currentUser.id}`)
            .then((res) => setConversations(res.data))
            .catch((err) => console.error("Error fetching inbox:", err));
        api.get("/users/all")
            .then((res) => setAllUsers(res.data))
            .catch((err) => console.error("Error loading users:", err));
    }, [currentUser?.id]);

    useEffect(() => {
        activeConversationIdRef.current = conversationId;
    }, [conversationId]);

    useEffect(() => {
        if (!socketRef?.current || !currentUser?.id) return;

        const handleUnreadUpdate = ({ conversationId: updatedConvId, lastMessage, lastSenderId }) => {
            setConversations((prev) =>
                prev.map((conv) => {
                    if (conv.id !== updatedConvId) return conv;
                    const isActive = activeConversationIdRef.current === updatedConvId;
                    return {
                        ...conv,
                        lastMessage: lastMessage ?? conv.lastMessage,
                        lastSenderId: lastSenderId ?? conv.lastSenderId,
                        timestampOfLastMessage: { _seconds: Math.floor(Date.now() / 1000) },
                        unreadCounts: isActive
                            ? conv.unreadCounts
                            : { ...conv.unreadCounts, [currentUser.id]: (conv.unreadCounts?.[currentUser.id] ?? 0) + 1 },
                    };
                })
            );
        };

        socketRef.current.on("unread-update", handleUnreadUpdate);
        return () => socketRef.current?.off("unread-update", handleUnreadUpdate);
    }, [currentUser?.id, socketRef]);

    useEffect(() => {
        if (!conversationId || !currentUser?.id) return;
        setConversations((prev) =>
            prev.map((conv) =>
                conv.id === conversationId
                    ? { ...conv, unreadCounts: { ...conv.unreadCounts, [currentUser.id]: 0 } }
                    : conv
            )
        );
        api.post(`/conversations/${conversationId}/read`, { userId: currentUser.id })
            .catch((err) => console.error("Error marking conversation read:", err));
    }, [conversationId, currentUser?.id]);

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    const handleNewConversation = (conversation, otherUserId, otherUserDisplayName) => {
        closeModal();
        setConversations((prev) => {
            if (prev.some((conv) => conv.id === conversation.id)) return prev;
            return [conversation, ...prev];
        });
        onSelectConversation(conversation.id, otherUserId, otherUserDisplayName);
    };

    const handleSelectItem = (user) => {
        const existing = conversations.find((conv) => conv.participants?.includes(user.id));
        if (existing) {
            onSelectConversation(existing.id, user.id, user.displayName);
        }
    };

    return (
        <div className="w-80 shrink-0 flex flex-col border-r border-[var(--accent-secondary)]/30 h-full bg-[var(--bg-primary)]">
            <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--accent-secondary)]/30">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-[var(--brand-color)] flex items-center justify-center text-xs font-bold text-[var(--text-on-brand)]">
                        {currentUser.displayName?.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-[var(--text-primary)] truncate">{currentUser.displayName}</span>
                </div>
                <button
                    onClick={openModal}
                    className="text-[var(--accent-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    aria-label="New message"
                >
                    <Pencil2Icon className="w-5 h-5" />
                </button>
            </div>

            <ScrollArea.Root className="flex-1 overflow-hidden">
                <ScrollArea.Viewport className="h-full w-full">
                    {sortedConversations.length === 0 ? (
                        <p className="text-[var(--accent-secondary)] text-sm text-center py-8 px-4">
                            No conversations yet.
                        </p>
                    ) : (
                        sortedConversations.map((conversation) => {
                            const otherId = conversation.participants?.find((participantId) => participantId !== currentUser.id);
                            const otherUser = userMap[otherId] || { id: otherId, displayName: otherId || "Unknown" };
                            return (
                                <ConversationItem
                                    key={conversation.id}
                                    user={otherUser}
                                    conversation={conversation}
                                    currentUser={currentUser}
                                    isSelected={conversation.id === conversationId}
                                    onSelect={handleSelectItem}
                                />
                            );
                        })
                    )}
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar orientation="vertical" className="w-1">
                    <ScrollArea.Thumb className="bg-[var(--accent-secondary)]/40 rounded" />
                </ScrollArea.Scrollbar>
            </ScrollArea.Root>

            <NewConversationModal
                open={modalOpen}
                onClose={closeModal}
                currentUser={currentUser}
                allUsers={allUsers}
                onConversationStarted={handleNewConversation}
            />
        </div>
    );
}

export default ConversationList;
