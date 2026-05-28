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
    increment,
    serverTimestamp,
    arrayUnion,
    arrayRemove
} = require("firebase/firestore");
const { db } = require("../firebase.js");


const createForum = async (title, content, createdBy, creatorId, attachedTrack = null) => {
    const docRef = await addDoc(collection(db, "forums"), {
        title,
        content,
        createdBy,
        creatorId,
        attachedTrack,
        likes: 0,
        createdAt: serverTimestamp(),
        likedBy: []
    });
    return docRef.id;
};

// ordered by newest first
const fetchAllForums = async () => {
    const q = query(collection(db, "forums"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

const searchForumsByName = async (searchQuery) => {
    const q = query(
        collection(db, "forums"),
        where("title", ">=", searchQuery),
        where("title", "<=", searchQuery + "\uf8ff")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// 1 for like -1 for removing a like
const likeForumPost = async (forumId, userId) => {
    const forumRef = doc(db, "forums", forumId);
    const forumSnap = await getDoc(forumRef);
    const likedBy = forumSnap.data().likedBy || [];
    const alreadyLiked = likedBy.includes(userId);

    await updateDoc(forumRef, {
        likedBy: alreadyLiked ? arrayRemove(userId) : arrayUnion(userId),
        likes: increment(alreadyLiked ? -1 : 1),
    });

    return !alreadyLiked; // returns new liked state
};


const addCommentToForum = async (forumId, authorId, comment) => {
    const commentsSubcollectionRef = collection(db, "forums", forumId, "comments");
    const docRef = await addDoc(commentsSubcollectionRef, {
        authorId,
        comment,
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: [],
    });
    return docRef.id;
};


const fetchForumComments = async (forumId) => {
    const commentsRef = collection(db, "forums", forumId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

const likeForumComment = async (forumId, commentId, userId) => {
    const commentRef = doc(db, "forums", forumId, "comments", commentId);
    const commentSnap = await getDoc(commentRef);
    const likedBy = commentSnap.data().likedBy || [];
    const alreadyLiked = likedBy.includes(userId);

    await updateDoc(commentRef, {
        likedBy: alreadyLiked ? arrayRemove(userId) : arrayUnion(userId),
        likes: increment(alreadyLiked ? -1 : 1),
    });

    return !alreadyLiked;
};

module.exports = {
    createForum,
    fetchAllForums,
    searchForumsByName,
    likeForumPost,
    addCommentToForum,
    fetchForumComments,
    likeForumComment,
};