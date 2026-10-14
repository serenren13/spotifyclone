import { useState } from "react";
import { api } from "./inboxApi";

export function useNewConversationModal({ onClose, currentUser, allUsers, onConversationStarted }) {
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = allUsers.filter(
        (user) =>
            user.id !== currentUser.id &&
            user.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearchChange = (e) => setSearchQuery(e.target.value);

    const handleOpenChange = (isOpen) => {
        if (!isOpen) onClose();
    };

    const handleStartChat = async (otherUser) => {
        try {
            const res = await api.post("/conversations/initialize", {
                user1: currentUser.id,
                user2: otherUser.id,
            });
            setSearchQuery("");
            onConversationStarted(res.data, otherUser);
        } catch (err) {
            console.error("Error starting conversation:", err);
        }
    };

    return { searchQuery, filtered, handleSearchChange, handleOpenChange, handleStartChat };
}