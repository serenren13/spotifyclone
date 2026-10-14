import { useState, useEffect, useRef } from "react";
import { api } from "./inboxApi";

export function useConversationList({ currentUser, conversationId, onSelectConversation, updatePreviewRef, unreadUpdateRef }) {
    const [conversations, setConversations] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [usersLoaded, setUsersLoaded] = useState(false);
    const activeConversationIdRef = useRef(null);

    const applyUnreadUpdate = ({ conversationId: updatedConvId, lastMessage, lastSenderId }) => {
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

    useEffect(() => {
        if (!updatePreviewRef) return;
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
        return () => {
            if (updatePreviewRef) updatePreviewRef.current = null;
        };
    }, [updatePreviewRef]);

    // parent forwards unread-update via ref callback (avoids socket timing races)
    useEffect(() => {
        if (!unreadUpdateRef) return;
        unreadUpdateRef.current = applyUnreadUpdate;
        return () => {
            if (unreadUpdateRef) unreadUpdateRef.current = null;
        };
        // applyUnreadUpdate closes over currentUser.id; we re-register on currentUser.id change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [unreadUpdateRef, currentUser?.id]);

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
            .then((res) => {
                setAllUsers(res.data);
                setUsersLoaded(true);
            })
            .catch((err) => {
                console.error("Error loading users:", err);
                setUsersLoaded(true);
            });
    }, [currentUser?.id]);

    useEffect(() => {
        activeConversationIdRef.current = conversationId;
    }, [conversationId]);

    const markConversationRead = (id) => {
        if (!id || !currentUser?.id) return;
        setConversations((prev) =>
            prev.map((conv) =>
                conv.id === id
                    ? { ...conv, unreadCounts: { ...conv.unreadCounts, [currentUser.id]: 0 } }
                    : conv
            )
        );
        api.post(`/conversations/${id}/read`, { userId: currentUser.id })
            .catch((err) => console.error("Error marking conversation read:", err));
    };

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    const handleNewConversation = (conversation, otherUser) => {
        closeModal();
        setConversations((prev) => {
            if (prev.some((conv) => conv.id === conversation.id)) return prev;
            return [conversation, ...prev];
        });
        onSelectConversation(conversation.id, otherUser);
        markConversationRead(conversation.id);
    };

    const handleSelectItem = (user) => {
        const existing = conversations.find((conv) => conv.participants?.includes(user.id));
        if (existing) {
            onSelectConversation(existing.id, user);
            markConversationRead(existing.id);
        }
    };

    const currentDisplayName = currentUser.displayName || "You";
    const currentInitials = currentDisplayName.slice(0, 2).toUpperCase();

    return {
        modalOpen, allUsers, usersLoaded, userMap, sortedConversations,
        openModal, closeModal, handleNewConversation, handleSelectItem,
        currentDisplayName, currentInitials,
    };
}