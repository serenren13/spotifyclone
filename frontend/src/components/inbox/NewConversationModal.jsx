import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Avatar from "@radix-ui/react-avatar";
import { Cross2Icon } from "@radix-ui/react-icons";
import axios from "axios";
import { API_URL } from "../../lib/config";

const api = axios.create({ baseURL: API_URL });

function UserRow({ user, onSelect }) {
    const handleClick = () => onSelect(user);
    const initials = user.displayName?.slice(0, 2).toUpperCase() || "??";

    return (
        <button
            onClick={handleClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--accent-secondary)]/20 transition-colors text-left"
        >
            <Avatar.Root className="w-10 h-10 rounded-full overflow-hidden bg-[var(--brand-color)] flex items-center justify-center shrink-0">
                {user.profileImage && (
                    <Avatar.Image
                        src={user.profileImage}
                        alt={user.displayName || "User"}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                    />
                )}
                <Avatar.Fallback className="text-sm font-semibold text-[var(--text-on-brand)]">
                    {initials}
                </Avatar.Fallback>
            </Avatar.Root>
            <div>
                <p className="text-[var(--text-primary)] text-sm font-medium">{user.displayName}</p>
                <p className="text-[var(--accent-secondary)] text-xs">{user.email}</p>
            </div>
        </button>
    );
}

function NewConversationModal({ open, onClose, currentUser, allUsers, onConversationStarted }) {
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

    return (
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-[var(--bg-primary)] rounded-xl shadow-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <Dialog.Title className="text-[var(--text-primary)] font-bold text-lg">
                            New Message
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="text-[var(--accent-secondary)] hover:text-[var(--text-primary)] transition-colors">
                                <Cross2Icon className="w-5 h-5" />
                            </button>
                        </Dialog.Close>
                    </div>

                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
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
                                <UserRow key={user.id} user={user} onSelect={handleStartChat} />
                            ))
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export default NewConversationModal;
