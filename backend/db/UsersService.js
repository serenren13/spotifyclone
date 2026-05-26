const {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    getDoc,
    doc,
    query,
    where,
    setDoc,
} = require("firebase/firestore");
const { db } = require("../firebase.js");

const saveUser = async (userId, userData) => {
    const userRef = doc(db, "users", userId);
    await setDoc(
        userRef,
        {
            displayName: userData.displayName || "Anonymous",
            bio: userData.bio || "",
            isPrivate: userData.isPrivate ?? true,
            spotifyId: userData.spotifyId,
            email: userData.email,
            profileImage: userData.profileImage || null,
        },
        { merge: true } // this make it so this function works for create or update
    );
    return { id: userId, ...userData };
};

const userFromId = async (id) => {
    const userDoc = await getDoc(doc(db, "users", id));
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
};


const fetchPublicUsers = async () => {
    const q = query(collection(db, "users"), where("isPrivate", "==", false));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

const updateUserProfile = async (userId, updates) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updates);
};
 
module.exports = { saveUser, userFromId, fetchPublicUsers, updateUserProfile };