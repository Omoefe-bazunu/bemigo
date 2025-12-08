"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getIdToken as getFirebaseIdToken, // ✅ alias to avoid conflict
} from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      router.push("/cart");
      return userCredential;
    } catch (error) {
      console.error("Login error:", error.message);
      throw error;
    }
  };

  const signup = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential;
    } catch (error) {
      console.error("Signup error:", error.message);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // Get Firebase ID token for backend API calls
  const getIdToken = async (forceRefresh = false) => {
    if (!user) return null;

    try {
      const token = await getFirebaseIdToken(user, forceRefresh);
      return token;
    } catch (error) {
      console.error("Error getting ID token:", error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        getIdToken,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
