// app/account/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged, updateProfile, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      const firestoreData = userDoc.exists() ? userDoc.data() : {};

      const userData = {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: firestoreData.displayName || currentUser.displayName || "",
        phoneNumber: firestoreData.phoneNumber || "",
      };

      setUser(userData);
      setDisplayName(userData.displayName);
      setPhoneNumber(userData.phoneNumber);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleUpdate = async () => {
    if (!user || !auth.currentUser) return;
    setSaving(true);

    try {
      // Update Firebase Auth display name
      await updateProfile(auth.currentUser, {
        displayName: displayName || null,
      });

      // Update Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          displayName: displayName || null,
          phoneNumber: phoneNumber || null,
        },
        { merge: true }
      );

      // Force refresh the auth token to get updated profile
      await auth.currentUser.reload();

      // Update local state with the refreshed user data
      setUser((prev) => ({
        ...prev,
        displayName: displayName,
        phoneNumber: phoneNumber,
      }));

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      alert(`Failed to update profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This cannot be undone.")) return;

    try {
      await deleteDoc(doc(db, "users", user.uid));
      await auth.currentUser.delete();
      router.push("/");
    } catch (error) {
      alert("Could not delete account. Try signing in again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 py-10 px-8 text-white text-center">
            <h1 className="text-3xl font-bold">My Account</h1>
            <p className="mt-2 opacity-90">Manage your profile</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Simple Avatar (no upload) */}
            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-full bg-orange-100 flex items-center justify-center text-5xl font-bold text-orange-600 border-4 border-white shadow-lg">
                {displayName.charAt(0).toUpperCase() || "U"}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-600"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="mt-1 w-full px-4 py-3 border rounded-xl bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-1 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-600"
                  placeholder="+234..."
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-4 rounded-xl disabled:opacity-70"
              >
                {saving ? "Saving..." : "Update Profile"}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-medium py-4 rounded-xl"
              >
                Sign Out
              </button>
            </div>

            <div className="border-t pt-8 mt-10">
              <h3 className="text-lg font-semibold text-red-600 mb-4">
                Danger Zone
              </h3>
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-xl"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
