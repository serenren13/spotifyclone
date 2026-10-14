import { useEffect, useRef } from "react";
import { api } from "./inboxApi";

export function useChatPanel({ currentUser, conversationId, otherUser, messages, setMessages, onMessageSent }) {
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

    return { bottomRef, handleSend, enrichedMessages, displayName, initials };
}