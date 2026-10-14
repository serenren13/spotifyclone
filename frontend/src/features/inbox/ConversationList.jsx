import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Avatar from "@radix-ui/react-avatar";
import { Pencil2Icon } from "@radix-ui/react-icons";
import ConversationItem from "./ConversationItem";
import NewConversationModal from "./NewConversationModal";
import { useConversationList } from "./useConversationList";

function ConversationList({ currentUser, conversationId, onSelectConversation, updatePreviewRef, unreadUpdateRef }) {
    const {
        modalOpen, allUsers, usersLoaded, userMap, sortedConversations,
        openModal, closeModal, handleNewConversation, handleSelectItem,
        currentDisplayName, currentInitials,
    } = useConversationList({ currentUser, conversationId, onSelectConversation, updatePreviewRef, unreadUpdateRef });
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
