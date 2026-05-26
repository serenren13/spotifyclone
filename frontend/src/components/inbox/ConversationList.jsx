import { useState, useEffect } from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import axios from "axios";
import ConversationItem from "./ConversationItem";
import NewConversationModal from "./NewConversationModal";

const api = axios.create({ baseURL: "http://127.0.0.1:5001/api" });

function ConversationList({ currentUser, conversationId, userMap, allUsers, onSelectConversation, onConversationsLoaded }) {
    const [conversations, setConversations] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (!currentUser?.id) return;
        api.get(`/conversations/inbox/${currentUser.id}`)
            .then((res) => {
                setConversations(res.data);
                onConversationsLoaded?.(res.data);
            })
            .catch((err) => console.error("Error fetching inbox:", err));
    }, [currentUser?.id]);

    const handleNewConversation = (newConversationId, otherUserId) => {
        setModalOpen(false);
        api.get(`/conversations/inbox/${currentUser.id}`)
            .then((res) => {
                setConversations(res.data);
                onConversationsLoaded?.(res.data);
            })
            .catch(() => {});
        onSelectConversation(newConversationId, otherUserId);
    };

    return (
        <div className="w-80 shrink-0 flex flex-col border-r border-[var(--accent-secondary)]/30 h-full bg-[var(--bg-primary)]">
            <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--accent-secondary)]/30">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--brand-color)] flex items-center justify-center text-xs font-bold text-[var(--text-light)]">
                        {currentUser.displayName?.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-[var(--text-primary)]">{currentUser.displayName}</span>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="text-[var(--accent-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    aria-label="New message"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>

            <ScrollArea.Root className="flex-1 overflow-hidden">
                <ScrollArea.Viewport className="h-full w-full">
                    {conversations.length === 0 ? (
                        <p className="text-[var(--accent-secondary)] text-sm text-center py-8 px-4">
                            No conversations yet. Hit + to start one!
                        </p>
                    ) : (
                        conversations.map((conv) => (
                            <ConversationItem
                                key={conv.id}
                                conversation={conv}
                                currentUser={currentUser}
                                userMap={userMap}
                                isSelected={conv.id === conversationId}
                                onSelect={onSelectConversation}
                            />
                        ))
                    )}
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar orientation="vertical" className="w-1">
                    <ScrollArea.Thumb className="bg-[var(--accent-secondary)]/40 rounded" />
                </ScrollArea.Scrollbar>
            </ScrollArea.Root>

            <NewConversationModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                currentUser={currentUser}
                allUsers={allUsers}
                onConversationStarted={handleNewConversation}
            />
        </div>
    );
}

export default ConversationList;
