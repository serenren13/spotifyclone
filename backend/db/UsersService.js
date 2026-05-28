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
    const userDoc = await getDoc(userRef);

    const { topArtists, topTracks, likedTracks, ...profileData } = userData; // fix: likedTracks

    const musicData = {
        topArtists: topArtists || [],
        topTracks: topTracks || [],
        likedTracks: likedTracks || [],                                       // fix: likedTracks
    };

    if (!userDoc.exists()) {
        await setDoc(userRef, {
            displayName: profileData.displayName || "Anonymous",
            bio: "",
            isPrivate: true,
            email: profileData.email,
            profileImage: profileData.profileImage || null,
            favoriteSongs: [],
            spotifyId: profileData.spotifyId || userId,
            ...musicData,
        });
    } else {
        await setDoc(userRef, { ...profileData, ...musicData }, { merge: true });
    }

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

const fetchAllUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const updateUserProfile = async (userId, updates) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updates);
};

module.exports = { saveUser, userFromId, fetchPublicUsers, fetchAllUsers, updateUserProfile };