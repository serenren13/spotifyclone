const {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    getDoc,
    doc,
    query,
    where,
    orderBy,
    serverTimestamp,
} = require("firebase/firestore");
const { db } = require("../firebase.js");

const getOrCreateConversation = async (user1, user2) => {
    const sortedParticipants = [user1, user2].sort();

    const q = query(
        collection(db, "conversations"),
        where("participants", "==", sortedParticipants)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        const existingChat = snapshot.docs[0];
        return { id: existingChat.id, ...existingChat.data() };
    }

    const docRef = await addDoc(collection(db, "conversations"), {
        participants: sortedParticipants,
        lastMessage: "",
        timestampOfLastMessage: serverTimestamp(),
    });

    return { id: docRef.id, participants: sortedParticipants, lastMessage: "" };
};

const sendMessage = async (conversationId, senderId, text) => {
    const conversationRef = doc(db, "conversations", conversationId);
    const messagesSubcollectionRef = collection(conversationRef, "messages");

    const newMessageRef = await addDoc(messagesSubcollectionRef, {
        senderId,
        text,
        createdAt: serverTimestamp(),
    });

    await updateDoc(conversationRef, {
        lastMessage: text,
        timestampOfLastMessage: serverTimestamp(),
    });

    return { id: newMessageRef.id, senderId, text };
};

const fetchMessagesForConversation = async (conversationId) => {
    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

const fetchUserInbox = async (userId) => {
    const q = query(
        collection(db, "conversations"),
        where("participants", "array-contains", userId),
        orderBy("timestampOfLastMessage", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

module.exports = {
    getOrCreateConversation,
    sendMessage,
    fetchMessagesForConversation,
    fetchUserInbox,
};