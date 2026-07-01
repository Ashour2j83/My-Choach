import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Firebase Auth user object
  const [userData, setUserData] = useState(null); // Firestore document (isActive, role, etc.)
  const [loading, setLoading] = useState(true);

  // ── SIGN UP ──
  async function signup(email, password, name) {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Save extra info in Firestore — separate from Auth
    await setDoc(doc(db, "users", result.user.uid), {
      name,
      email,
      isActive: false,        // coach has to activate manually
      role: "client",
      createdAt: serverTimestamp(),
    });

    // Send verification email
    await sendEmailVerification(result.user);

    return result;
  }

  // ── LOGIN ──
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // ── LOGOUT ──
  function logout() {
    return signOut(auth);
  }

  // ── RESEND VERIFICATION EMAIL ──
  async function resendVerification() {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  }

  // ── FETCH FIRESTORE USER DATA ──
  async function fetchUserData(uid) {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      setUserData(snap.data());
    } else {
      setUserData(null);
    }
  }

  // ── LISTEN FOR AUTH STATE CHANGES ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await currentUser.reload();          // refresh emailVerified status
        await fetchUserData(currentUser.uid); // get isActive, role, etc.
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userData,
    signup,
    login,
    logout,
    resendVerification,
    fetchUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}