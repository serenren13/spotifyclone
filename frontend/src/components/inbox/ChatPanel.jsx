import { useEffect, useRef } from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import axios from "axios";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

const api = axios.create({ baseURL: "http://127.0.0.1:5001/api" });

function ChatPanel({ currentUser, conversationId, otherUser, messages, setMessages, onMessageSent }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        if (!conversationId) return;
        api.get(`/conversations/${conversationId}/messages`)
            .then((res) => setMessages(res.data))
            .catch((err) => console.error("Error loading messages:", err));
    }, [conversationId]);

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

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-4 py-4 border-b border-[var(--accent-secondary)]/30 shrink-0">
                <div className="w-9 h-9 rounded-full bg-[var(--brand-color)] flex items-center justify-center text-xs font-bold text-[var(--text-on-brand)] shrink-0">
                    {otherUser?.displayName?.slice(0, 2).toUpperCase()}
                </div>
                <span className="font-bold text-[var(--text-primary)] truncate">{otherUser?.displayName}</span>
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
