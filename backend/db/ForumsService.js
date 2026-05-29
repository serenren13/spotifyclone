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

// ordered by newest first, with comment count from subcollection
const fetchAllForums = async () => {
    const q = query(collection(db, "forums"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const forums = await Promise.all(snapshot.docs.map(async (d) => {
        const commentsSnap = await getDocs(
            collection(db, "forums", d.id, "comments")
        );
        return { id: d.id, ...d.data(), commentCount: commentsSnap.size };
    }));

    return forums;
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

    return !alreadyLiked;
};


const addCommentToForum = async (forumId, authorId, authorName, comment, parentId = null, depth = 0) => {
    const commentsSubcollectionRef = collection(db, "forums", forumId, "comments");
    const docRef = await addDoc(commentsSubcollectionRef, {
        authorId,
        authorName,
        comment,
        parentId,
        depth,
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
    likeForumPost,
    addCommentToForum,
    fetchForumComments,
    likeForumComment,
};