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
  const [user, setUser]         = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading]   = useState(true);

  // ── SIGN UP ──
  async function signup(name, email, password) {
    // 1. إنشاء الحساب في Firebase Auth
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // 2. حفظ البيانات في Firestore
    await setDoc(doc(db, "users", result.user.uid), {
      name,
      email,
      status:    "inactive",   // الكوتش لازم يفعّله يدوي
      role:      "user",
      createdAt: serverTimestamp(),
    });

    // 3. بعت إيميل التحقق
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

  // ── RESEND VERIFICATION ──
  async function resendVerification() {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  }

  // ── GET USER DATA FROM FIRESTORE ──
  async function fetchUserData(uid) {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      setUserData(snap.data());
    } else {
      setUserData(null);
    }
  }

  // ── LISTEN TO AUTH STATE ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await currentUser.reload();           // refresh emailVerified
        await fetchUserData(currentUser.uid); // جيب status و role
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
    loading,
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