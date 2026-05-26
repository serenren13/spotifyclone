import * as Avatar from "@radix-ui/react-avatar";

function formatTime(timestamp) {
    if (!timestamp) return "";
    const date = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp);
    const diffMins = Math.floor((Date.now() - date) / 60000);
    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return `${Math.floor(diffMins / 1440)}d`;
}

function ConversationItem({ conversation, currentUser, userMap, isSelected, onSelect }) {
    const otherId = conversation.participants?.find((p) => p !== currentUser.id);
    const otherUser = userMap[otherId] || { displayName: otherId || "Unknown" };
    const initials = (otherUser.displayName || "?").slice(0, 2).toUpperCase();

    const handleSelect = () => onSelect(conversation.id, otherId);

    return (
        <button
            onClick={handleSelect}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-dark)] transition-colors text-left border-b border-[var(--accent-secondary)]/20 ${
                isSelected ? "bg-[var(--bg-dark)]" : ""
            }`}
        >
            <Avatar.Root className="shrink-0 w-12 h-12 rounded-full overflow-hidden bg-[var(--brand-color)] flex items-center justify-center">
                <Avatar.Fallback className="text-sm font-semibold text-[var(--text-light)]">
                    {initials}
                </Avatar.Fallback>
            </Avatar.Root>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-sm text-[var(--text-primary)] truncate">
                        {otherUser.displayName}
                    </span>
                    <span className="text-xs text-[var(--accent-secondary)] shrink-0 ml-2">
                        {formatTime(conversation.timestampOfLastMessage)}
                    </span>
                </div>
                <p className="text-xs text-[var(--accent-secondary)] truncate mt-0.5">
                    {conversation.lastMessage || "Start a conversation"}
                </p>
            </div>
        </button>
    );
}

export default ConversationItem;
