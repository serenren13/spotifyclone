function MessageBubble({ message, currentUser }) {
    const isMine = message.senderId === currentUser.id;

    return (
        <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}>
            <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm break-words ${
                    isMine
                        ? "bg-[var(--brand-color)] text-[var(--text-light)] rounded-br-sm"
                        : "bg-[var(--accent-secondary)]/30 text-[var(--text-primary)] rounded-bl-sm"
                }`}
            >
                {message.text}
            </div>
        </div>
    );
}

export default MessageBubble;
