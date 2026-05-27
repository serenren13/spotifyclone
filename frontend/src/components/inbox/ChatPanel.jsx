import { useEffect, useRef, useState } from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import axios from "axios";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

const api = axios.create({ baseURL: "http://127.0.0.1:5001/api" });

function ChatPanel({ currentUser, conversationId, otherUser, messages, setMessages }) {
    const bottomRef = useRef(null);
    const pollRef = useRef(null);


    const fetchMessages = async () => {
        try {
            const res = await api.get(`/conversations/${conversationId}/messages`);
            setMessages(res.data);
        } catch (err) {
            console.error("Error loading messages:", err);
        }
    };

    useEffect(() => {
        if (!conversationId) return;
        fetchMessages();
        pollRef.current = setInterval(fetchMessages, 3000);
        return () => clearInterval(pollRef.current);
    }, [conversationId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (text) => {
        try {
            await api.post(`/conversations/${conversationId}/messages`, {
                senderId: currentUser.id,
                text,
            });
            await fetchMessages();
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    return (
        <div className="flex flex-col h-full">
<ScrollArea.Root className="flex-1 overflow-hidden">
                <ScrollArea.Viewport className="h-full w-full px-4 py-4">
                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} currentUser={currentUser} />
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
