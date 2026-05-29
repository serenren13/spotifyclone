import { useEffect, useRef } from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Avatar from "@radix-ui/react-avatar";
import axios from "axios";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { API_URL } from "../../lib/config";

const api = axios.create({ baseURL: API_URL });

function ChatPanel({ currentUser, conversationId, otherUser, messages, setMessages, onMessageSent }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (text) => {
        const optimistic = {
            id: `optimistic-${Date.now()}`,
            senderId: currentUser.id,
            text,
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimistic]);
        onMessageSent?.({ conversationId, lastMessage: text, lastSenderId: currentUser.id });

        try {
            await api.post(`/conversations/${conversationId}/messages`, {
                senderId: currentUser.id,
                text,
            });
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    const enrichedMessages = messages.map((msg, index) => {
        const nextMsg = messages[index + 1];
        const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;
        return { ...msg, isLastInGroup };
    });

    const displayName = otherUser?.displayName || "Unknown user";
    const initials = displayName.slice(0, 2).toUpperCase();

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-4 py-4 border-b border-[var(--accent-secondary)]/30 shrink-0">
                <Avatar.Root className="shrink-0 w-9 h-9 rounded-full overflow-hidden bg-[var(--brand-color)] flex items-center justify-center">
                    {otherUser?.profileImage && (
                        <Avatar.Image
                            src={otherUser.profileImage}
                            alt={displayName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                        />
                    )}
                    <Avatar.Fallback className="text-xs font-bold text-[var(--text-on-brand)]">
                        {initials}
                    </Avatar.Fallback>
                </Avatar.Root>
                <span className="font-bold text-[var(--text-primary)] truncate">{displayName}</span>
            </div>
            <ScrollArea.Root className="flex-1 overflow-hidden">
                <ScrollArea.Viewport className="h-full w-full px-4 py-4">
                    {enrichedMessages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} currentUser={currentUser} isLastInGroup={msg.isLastInGroup} />
                    ))}
                    <div ref={bottomRef} />
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar orientation="vertical" className="w-1">
                    <ScrollArea.Thumb className="bg-[var(--accent-secondary)]/40 rounded" />
                </ScrollArea.Scrollbar>
            </ScrollArea.Root>

            <MessageInput onSend={handleSend} />
        </div>
    );
}

export default ChatPanel;
