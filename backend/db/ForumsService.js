import {
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
} from "firebase/firestore";
import { db } from "../firebase.js";


const createForum = async (title, content, createdBy) => {
    const docRef = await addDoc(collection(db, "forums"), {
        title,
        content,
        createdBy,
        createdAt: serverTimestamp(),
        likes: 0,
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
const likeForumPost = async (forumId, amount) => {
    const forumRef = doc(db, "forums", forumId);
    await updateDoc(forumRef, {
        likes: increment(amount),
    });
};


const addCommentToForum = async (forumId, authorId, comment) => {
    const commentsSubcollectionRef = collection(db, "forums", forumId, "comments");
    const docRef = await addDoc(commentsSubcollectionRef, {
        authorId,
        comment,
        createdAt: serverTimestamp(),
        likes: 0,
    });
    return docRef.id;
};


const fetchForumComments = async (forumId) => {
    const commentsRef = collection(db, "forums", forumId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

const likeForumComment = async (forumId, commentId, amount) => {
    const commentRef = doc(db, "forums", forumId, "comments", commentId);
    await updateDoc(commentRef, {
        likes: increment(amount),
    });
}

export {
    createForum,
    fetchAllForums,
    searchForumsByName,
    likeForumPost,
    addCommentToForum,
    fetchForumComments,
    likeForumComment
};