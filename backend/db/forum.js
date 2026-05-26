const {
    collection,
    doc,
    increment,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    serverTimestamp
} = require("firebase/firestore");
const db = require("../firebase");

const forumPostsCollection = collection(db, "forumPosts");

async function addForumPosts( title, content, createdBy ){
    return await addDoc(forumPostsCollection, {
        title,
        content,
        createdBy,
        createdAt: serverTimestamp(),
        likes: 0,
    });
}

async function fetchAllForumPosts() {
    const snapshot = await getDocs(forumPostsCollection);
    return snapshot.docs.map((forumPostsDoc) => ({
        forumPostsId: forumPostsDoc.id,
        ...forumPostsDoc.data(),
    }));
}

async function fetchForumPostById( forumId ) {
    const postRef = doc(db, "forumPosts", forumId);
    const snapshot = await getDoc(postRef);
    return { forumId: snapshot.id, ...snapshot.data() } 
};

async function deleteForumPost( forumId ) {
    const postRef = doc(db, "forumPosts", forumId);
    return await deleteDoc(postRef);
}

async function addComment( forumId, authorId, comment ) {
    const commentRef = collection(db, "forumPosts", forumId, "comments");
    return await addDoc( commentRef, {
        authorId,
        comment,
        createdAt: serverTimestamp(),
        likes: 0,
    })
}

async function likeForumPost( forumId ) {
    const postRef = doc(db, "forumPosts", forumId);
    return await updateDoc(postRef, {
        likes: increment(1),
    });
}

async function unlikeForumPost( forumId ) {
    const postRef = doc(db, "forumPosts", forumId);
    return await updateDoc(postRef, {
        likes: increment(-1),
    })
}

async function fetchAllComments( forumId ) {
    const commentRef = collection(db, "forumPosts", forumId, "comments");
    const snapshot = await getDocs(commentRef);
    return snapshot.docs.map((commentsDoc) => ({
        commentId: commentsDoc.id,
        ...commentsDoc.data(),
    }));
}

module.exports = {
    addForumPosts,
    fetchAllForumPosts,
    fetchForumPostById,
    deleteForumPost,
    addComment,
    likeForumPost,
    unlikeForumPost,
    fetchAllComments,
}