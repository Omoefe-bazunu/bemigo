// app/account/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebaseConfig";
import { onAuthStateChanged, updateProfile, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from "next/image";

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("/default-avatar.png");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      const userData = {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || "",
        phoneNumber: currentUser.phoneNumber || "",
        photoURL: currentUser.photoURL || "/default-avatar.png",
        emailVerified: currentUser.emailVerified,
      };

      // Fetch additional data from Firestore (phone, custom name)
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        userData.displayName = data.displayName || userData.displayName;
        userData.phoneNumber = data.phoneNumber || userData.phoneNumber;
      }

      setUser(userData);
      setDisplayName(userData.displayName || "");
      setPhoneNumber(userData.phoneNumber || "");
      setPhotoPreview(userData.photoURL);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    if (!user) return;
    setSaving(true);

    try {
      let photoURL = user.photoURL;

      // Upload new photo if selected
      if (photoFile) {
        const photoRef = ref(storage, `profile-pics/${user.uid}`);
        await uploadBytes(photoRef, photoFile);
        photoURL = await getDownloadURL(photoRef);
      }

      // Update Auth profile
      await updateProfile(auth.currentUser, {
        displayName,
        photoURL,
      });

      // Update Firestore user doc
      await setDoc(
        doc(db, "users", user.uid),
        {
          displayName,
          phoneNumber: phoneNumber || null,
          photoURL,
        },
        { merge: true }
      );

      alert("Profile updated successfully!");
      setPhotoFile(null);
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This cannot be undone."
      )
    )
      return;

    try {
      await deleteDoc(doc(db, "users", user.uid));
      await auth.currentUser.delete();
      router.push("/");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Could not delete account. Sign in again and try.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20  px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 py-10 px-8 text-white text-center">
            <h1 className="text-3xl font-bold">My Account</h1>
            <p className="mt-2 opacity-90">Update your profile</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Profile Photo Upload */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-6 border-white shadow-2xl overflow-hidden bg-gray-100">
                  <Image
                    src={photoPreview}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              <label className="mt-4 cursor-pointer">
                <span className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition">
                  Change Photo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">JPG, PNG up to 5MB</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email (cannot change)
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
                  className="mt-1 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
                  placeholder="+234..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-4 rounded-xl transition disabled:opacity-70"
              >
                {saving ? "Saving..." : "Update Profile"}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-medium py-4 rounded-xl transition"
              >
                Sign Out
              </button>
            </div>

            {/* Danger Zone */}
            <div className="border-t pt-8 mt-10">
              <h3 className="text-lg font-semibold text-red-600 mb-4">
                Danger Zone
              </h3>
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-xl transition"
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
