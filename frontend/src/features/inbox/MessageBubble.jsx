function formatMessageTime(timestamp) {
    if (!timestamp) return "";
    let date;
    if (timestamp._seconds !== undefined) {
        date = new Date(timestamp._seconds * 1000);
    } else if (timestamp.seconds !== undefined) {
        date = new Date(timestamp.seconds * 1000);
    } else {
        date = new Date(timestamp);
    }
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function MessageBubble({ message, currentUser, isLastInGroup }) {
    const isMine = message.senderId === currentUser.id;
    const timeLabel = formatMessageTime(message.createdAt);

    return (
        <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} ${isLastInGroup ? "mb-3" : "mb-0.5"}`}>
            <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm break-words ${
                    isMine
                        ? "bg-[var(--brand-color)] text-[var(--text-on-brand)] rounded-br-sm"
                        : "bg-[var(--accent-secondary)]/30 text-[var(--text-primary)] rounded-bl-sm"
                }`}
            >
                {message.text}
            </div>
            {isLastInGroup && timeLabel && (
                <span className="text-[10px] text-[var(--accent-secondary)] mt-0.5 px-1">
                    {timeLabel}
                </span>
            )}
        </div>
    );
}

export default MessageBubble;
