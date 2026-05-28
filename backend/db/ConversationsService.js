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
    increment,
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
    const conversationSnap = await getDoc(conversationRef);
    const { participants } = conversationSnap.data();

    const createdAtIso = new Date().toISOString();

    const messagesSubcollectionRef = collection(conversationRef, "messages");
    const newMessageRef = await addDoc(messagesSubcollectionRef, {
        senderId,
        text,
        createdAt: serverTimestamp(),
    });

    const unreadUpdates = {};
    participants.forEach((participantId) => {
        if (participantId !== senderId) {
            unreadUpdates[`unreadCounts.${participantId}`] = increment(1);
        }
    });

    await updateDoc(conversationRef, {
        lastMessage: text,
        lastSenderId: senderId,
        timestampOfLastMessage: serverTimestamp(),
        ...unreadUpdates,
    });

    return { id: newMessageRef.id, senderId, text, participants, createdAt: createdAtIso };
};

const markConversationRead = async (conversationId, userId) => {
    const conversationRef = doc(db, "conversations", conversationId);
    await updateDoc(conversationRef, { [`unreadCounts.${userId}`]: 0 });
};

const fetchMessagesForConversation = async (conversationId, since = null) => {
    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const q = since
        ? query(messagesRef, where("createdAt", ">", since), orderBy("createdAt", "asc"))
        : query(messagesRef, orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

const fetchUserInbox = async (userId) => {
    const q = query(
        collection(db, "conversations"),
        where("participants", "array-contains", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

module.exports = {
    getOrCreateConversation,
    sendMessage,
    fetchMessagesForConversation,
    fetchUserInbox,
    markConversationRead,
};