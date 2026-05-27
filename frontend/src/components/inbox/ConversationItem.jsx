import * as Avatar from "@radix-ui/react-avatar";

function ConversationItem({ user, conversation, currentUser, isSelected, onSelect }) {
    const initials = (user.displayName || "?").slice(0, 2).toUpperCase();
    const unreadCount = conversation?.unreadCounts?.[currentUser.id] ?? 0;
    const hasUnread = unreadCount > 0;

    const handleSelect = () => onSelect(user);

    return (
        <button
            onClick={handleSelect}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--brand-color)]/15 transition-colors text-left border-b border-[var(--accent-secondary)]/20 ${
                isSelected ? "bg-[var(--brand-color)]/15" : ""
            }`}
        >
            <Avatar.Root className="shrink-0 w-9 h-9 rounded-full overflow-hidden bg-[var(--brand-color)] flex items-center justify-center">
                <Avatar.Fallback className="text-xs font-semibold text-[var(--text-on-brand)]">
                    {initials}
                </Avatar.Fallback>
            </Avatar.Root>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm truncate ${hasUnread ? "font-bold" : "font-semibold"} text-[var(--text-primary)]`}>
                        {user.displayName}
                    </span>
                    {hasUnread && (
                        <span className="shrink-0 w-5 h-5 rounded-full bg-[var(--brand-color)] flex items-center justify-center text-[10px] font-bold text-[var(--text-on-brand)]">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </div>
                {conversation?.lastMessage ? (
                    <p className={`text-xs truncate mt-0.5 ${hasUnread ? "font-semibold text-[var(--text-primary)]" : "text-[var(--accent-secondary)]"}`}>
                        {conversation.lastSenderId === currentUser.id ? `You: ${conversation.lastMessage}` : conversation.lastMessage}
                    </p>
                ) : null}
            </div>
        </button>
    );
}

export default ConversationItem;
