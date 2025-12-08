"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { fullName, phoneNumber, email, password, confirmPassword } =
      formData;

    // Validation (same as before)
    if (!fullName || !email || !password || !confirmPassword) {
      setError("All fields are required");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. CRITICAL: Wait for auth state to update (this fixes everything)
      await new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
          if (u) {
            unsubscribe();
            resolve(u);
          }
        });
      });

      // 3. Now safe to write to Firestore
      const userData = {
        displayName: fullName.trim(),
        phoneNumber: phoneNumber.trim() || "",
        email: user.email,
        createdAt: Timestamp.now(),
      };

      await setDoc(doc(db, "users", user.uid), userData);

      alert("Account created successfully!");
      router.push("/cart");
    } catch (err) {
      console.error("Signup error:", err);
      let errorMessage = "Failed to create account.";

      if (err.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-screen py-25 px-4 bg-gray-100 relative">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl z-10">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Create Your Account
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-600 focus:border-orange-600 transition"
            required
            disabled={loading}
          />

          {/* Phone Number */}
          <input
            type="tel"
            name="phoneNumber"
            placeholder="Phone Number (e.g. +2349012345678)"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-600 focus:border-orange-600 transition"
            disabled={loading}
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-orange-600 focus:border-orange-600 transition"
            required
            disabled={loading}
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-orange-600 focus:border-orange-600 transition"
              required
              minLength="6"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-orange-700"
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-orange-600 focus:border-orange-600 transition"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-orange-700"
              disabled={loading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-3.5 rounded-lg transition duration-200 shadow-md ${
              loading
                ? "bg-orange-400 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-700 text-white"
            }`}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-bold text-orange-600 hover:underline"
          >
            Log In
          </a>
        </p>
      </div>
    </section>
  );
}
