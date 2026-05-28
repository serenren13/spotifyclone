import { useState, useEffect, useRef } from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Avatar from "@radix-ui/react-avatar";
import { Pencil2Icon } from "@radix-ui/react-icons";
import axios from "axios";
import ConversationItem from "./ConversationItem";
import NewConversationModal from "./NewConversationModal";
import { API_URL } from "../../lib/config";

const api = axios.create({ baseURL: API_URL });

function ConversationList({ currentUser, conversationId, onSelectConversation, updatePreviewRef, unreadUpdateRef }) {
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

    return (
        <div className="w-80 shrink-0 flex flex-col border-r border-[var(--accent-secondary)]/30 h-full bg-[var(--bg-primary)]">
            <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--accent-secondary)]/30">
                <div className="flex items-center gap-2">
                    <Avatar.Root className="shrink-0 w-9 h-9 rounded-full overflow-hidden bg-[var(--brand-color)] flex items-center justify-center">
                        {currentUser.profileImage && (
                            <Avatar.Image
                                src={currentUser.profileImage}
                                alt={currentDisplayName}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                            />
                        )}
                        <Avatar.Fallback className="text-xs font-bold text-[var(--text-on-brand)]">
                            {currentInitials}
                        </Avatar.Fallback>
                    </Avatar.Root>
                    <span className="font-bold text-[var(--text-primary)] truncate">{currentDisplayName}</span>
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
                    {!usersLoaded ? (
                        <p className="text-[var(--accent-secondary)] text-sm text-center py-8 px-4">
                            Loading conversations...
                        </p>
                    ) : sortedConversations.length === 0 ? (
                        <p className="text-[var(--accent-secondary)] text-sm text-center py-8 px-4">
                            No conversations yet.
                        </p>
                    ) : (
                        sortedConversations.map((conversation) => {
                            const otherId = conversation.participants?.find((participantId) => participantId !== currentUser.id);
                            const otherUser = userMap[otherId] || { id: otherId, displayName: "Unknown user", profileImage: null };
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
