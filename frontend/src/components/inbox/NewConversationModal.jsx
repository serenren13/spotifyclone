import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Avatar from "@radix-ui/react-avatar";
import axios from "axios";

const api = axios.create({ baseURL: "http://127.0.0.1:5001/api" });

function NewConversationModal({ open, onClose, currentUser, allUsers, onConversationStarted }) {
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = allUsers.filter(
        (u) =>
            u.id !== currentUser.id &&
            u.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleStartChat = async (otherUser) => {
        try {
            const res = await api.post("/conversations/initialize", {
                user1: currentUser.id,
                user2: otherUser.id,
            });
            setSearchQuery("");
            onConversationStarted(res.data.id, otherUser.id);
        } catch (err) {
            console.error("Error starting conversation:", err);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-[var(--bg-primary)] rounded-xl shadow-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <Dialog.Title className="text-[var(--text-primary)] font-bold text-lg">
                            New Message
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="text-[var(--accent-secondary)] hover:text-[var(--text-primary)] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </Dialog.Close>
                    </div>

                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name..."
                        className="w-full bg-[var(--accent-secondary)]/20 text-[var(--text-primary)] placeholder-[var(--accent-secondary)] rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[var(--brand-color)] mb-4"
                        autoFocus
                    />

                    <div className="space-y-1 max-h-64 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <p className="text-[var(--accent-secondary)] text-sm text-center py-4">
                                {searchQuery ? "No users found." : "No users available."}
                            </p>
                        ) : (
                            filtered.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => handleStartChat(user)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--accent-secondary)]/20 transition-colors text-left"
                                >
                                    <Avatar.Root className="w-10 h-10 rounded-full bg-[var(--brand-color)] flex items-center justify-center shrink-0">
                                        <Avatar.Fallback className="text-sm font-semibold text-[var(--text-light)]">
                                            {user.displayName?.slice(0, 2).toUpperCase() || "??"}
                                        </Avatar.Fallback>
                                    </Avatar.Root>
                                    <div>
                                        <p className="text-[var(--text-primary)] text-sm font-medium">{user.displayName}</p>
                                        <p className="text-[var(--accent-secondary)] text-xs">{user.email}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export default NewConversationModal;
