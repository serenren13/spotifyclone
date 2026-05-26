import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    getDoc,
    doc,
    query,
    where,
    setDoc,
} from "firebase/firestore";
import { db } from "../firebase.js";

const saveUser = async (userId, userData) => {
    const userRef = doc(db, "users", userId);
    await setDoc(
        userRef,
        {
            displayName: userData.displayName || "Anonymous",
            bio: userData.bio || "",
            isPrivate: userData.isPrivate ?? false,
            spotifyId: userData.spotifyId,
            email: userData.email,
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

export { saveUser, userFromId, fetchPublicUsers };