import { useState, useEffect } from "react";
import axios from "axios";
import { useSpotify } from "../context/SpotifyContext";
import ConversationList from "../components/inbox/ConversationList";
import ChatPanel from "../components/inbox/ChatPanel";

const api = axios.create({ baseURL: "http://127.0.0.1:5001/api" });

const TEST_USERS = [
    { id: "user-alice", displayName: "Alice Monroe", email: "alice@test.com" },
    { id: "user-bob", displayName: "Bob Chen", email: "bob@test.com" },
    { id: "user-carol", displayName: "Carol Davis", email: "carol@test.com" },
    { id: "user-dave", displayName: "Dave Kim", email: "dave@test.com" },
    { id: "user-eve", displayName: "Eve Santos", email: "eve@test.com" },
];

function Inbox() {
    const { userProfile } = useSpotify();

    const [currentUser, setCurrentUser] = useState(null);
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [allUsers, setAllUsers] = useState(TEST_USERS);
    const [otherUserId, setOtherUserId] = useState(null);

    const userMap = Object.fromEntries(allUsers.map((u) => [u.id, u]));

    useEffect(() => {
        const user = userProfile
            ? { id: userProfile.id, displayName: userProfile.display_name, email: userProfile.email }
            : TEST_USERS[0];
        setCurrentUser(user);

        api.post("/users/", {
            userId: user.id,
            displayName: user.displayName,
            email: user.email,
            spotifyId: user.id,
            isPrivate: false,
        }).catch(() => {});

        api.get("/users/discover")
            .then((res) => setAllUsers(res.data))
            .catch(() => {});
    }, [userProfile]);

    const handleSelectConversation = (id, otherId) => {
        setConversationId(id);
        setOtherUserId(otherId);
        setMessages([]);
    };

    if (!currentUser) return null;

    return (
        <div className="flex flex-col h-screen bg-[var(--bg-primary)] overflow-hidden">
            <div className="flex flex-1 overflow-hidden">
                <ConversationList
                    currentUser={currentUser}
                    conversationId={conversationId}
                    userMap={userMap}
                    allUsers={allUsers}
                    onSelectConversation={handleSelectConversation}
                />

                <div className="flex-1 border-l border-[var(--accent-secondary)]/30">
                    {conversationId ? (
                        <ChatPanel
                            currentUser={currentUser}
                            conversationId={conversationId}
                            otherUser={userMap[otherUserId] || { displayName: otherUserId || "Chat" }}
                            messages={messages}
                            setMessages={setMessages}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--accent-secondary)]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="text-lg text-[var(--text-primary)]">Select a conversation to start chatting</p>
                            <p className="text-sm">or hit + to message someone new</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Inbox;
