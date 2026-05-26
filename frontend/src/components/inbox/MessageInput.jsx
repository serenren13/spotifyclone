import { useState } from "react";

function MessageInput({ onSend }) {
    const [text, setText] = useState("");

    const handleSend = () => {
        if (!text.trim()) return;
        onSend(text.trim());
        setText("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex items-end gap-3 px-4 py-3 border-t border-[var(--accent-secondary)]/30">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message..."
                rows={1}
                className="flex-1 bg-[var(--accent-secondary)]/20 text-[var(--text-primary)] placeholder-[var(--accent-secondary)] rounded-2xl px-4 py-2.5 text-sm resize-none outline-none focus:ring-1 focus:ring-[var(--brand-color)] max-h-32 overflow-y-auto"
            />
            <button
                onClick={handleSend}
                disabled={!text.trim()}
                className="shrink-0 text-[var(--brand-color)] disabled:opacity-30 hover:text-[var(--accent-primary)] transition-colors pb-2"
                aria-label="Send"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            </button>
        </div>
    );
}

export default MessageInput;
