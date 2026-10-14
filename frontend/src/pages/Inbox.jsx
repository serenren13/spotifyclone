import ConversationList from "../features/inbox/ConversationList";
import ChatPanel from "../features/inbox/ChatPanel";
import { useInbox } from "../features/inbox/useInbox";

function Inbox() {
    const {
        currentUser, conversationId, handleSelectConversation, updatePreviewRef,
        unreadUpdateRef, handleBack, otherUser, messages, setMessages,
        handleMessageSent,
    } = useInbox();
    if (!currentUser) return (
        <div className="flex items-center justify-center h-screen text-[var(--accent-secondary)]">
            <p>Please log in to use inbox.</p>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-[var(--bg-primary)] overflow-hidden">
            <div className="flex flex-1 min-h-0 overflow-hidden">

                {/* Conversation list — hidden on mobile when a chat is open */}
                <div className={`
                    w-80 shrink-0 h-full
                    ${conversationId ? 'hidden md:flex' : 'flex'}
                    flex-col
                `}>
                    <ConversationList
                        currentUser={currentUser}
                        conversationId={conversationId}
                        onSelectConversation={handleSelectConversation}
                        updatePreviewRef={updatePreviewRef}
                        unreadUpdateRef={unreadUpdateRef}
                    />
                </div>

                {/* Chat panel — full width on mobile when open */}
                <div className={`
                    flex-1 border-l border-[var(--accent-secondary)]/30
                    ${conversationId ? 'flex' : 'hidden md:flex'}
                    flex-col
                `}>
                    {conversationId ? (
                        <div className="flex flex-col h-full">
                            {/* Mobile back button */}
                            <div className="md:hidden flex items-center px-4 py-2 border-b border-[var(--accent-secondary)]/30">
                                <button
                                    onClick={handleBack}
                                    className="text-[var(--accent-primary)] text-sm flex items-center gap-1 hover:opacity-80"
                                >
                                    ← Back
                                </button>
                            </div>
                            <ChatPanel
                                currentUser={currentUser}
                                conversationId={conversationId}
                                otherUser={otherUser}
                                messages={messages}
                                setMessages={setMessages}
                                onMessageSent={handleMessageSent}
                            />
                        </div>
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
