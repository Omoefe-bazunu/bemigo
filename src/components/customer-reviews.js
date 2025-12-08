"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import Image from "next/image";
import { auth, db, storage } from "@/lib/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const styles = `
  @keyframes slideIn {
    0% { opacity: 0; transform: translateX(100%); }
    100% { opacity: 1; transform: translateX(0); }
  }

  @keyframes slideOut {
    0% { opacity: 1; transform: translateX(0); }
    100% { opacity: 0; transform: translateX(-100%); }
  }

  .slide-enter {
    animation: slideIn 0.8s ease forwards;
  }

  .slide-exit {
    animation: slideOut 0.8s ease forwards;
  }

  .half-visible {
    transform: scale(0.9);
    opacity: 0.6;
    filter: blur(1px);
  }

  .animate-fadeIn {
    animation: fadeIn 1s ease-in-out forwards;
  }

  @keyframes fadeIn {
    from { opacity: 0 }
    to { opacity: 1 }
  }
`;

export default function CustomerReviews() {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [user, setUser] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [form, setForm] = useState({
    name: "",
    review: "",
    rating: 0,
    photo: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const q = query(collection(db, "reviews"), where("uid", "==", u.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docData = { id: snap.docs[0].id, ...snap.docs[0].data() };
          setUserReview(docData);
          // Only populate form when user clicks edit, not on mount
          setIsEditing(true);
        } else {
          // Reset form for new review
          setForm({
            name: "",
            review: "",
            rating: 0,
            photo: null,
          });
          setIsEditing(false);
        }
      } else {
        setUserReview(null);
        setForm({
          name: "",
          review: "",
          rating: 0,
          photo: null,
        });
        setIsEditing(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch All Reviews
  useEffect(() => {
    const fetchReviews = async () => {
      const snapshot = await getDocs(collection(db, "reviews"));
      const allReviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReviews(allReviews);
    };
    fetchReviews();
  }, []);

  // Auto-slide carousel
  useEffect(() => {
    if (reviews.length > 1) {
      const timer = setTimeout(() => {
        setIsSliding(true);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % reviews.length);
          setIsSliding(false);
        }, 800);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, reviews]);

  const renderStars = (rating, setRating) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        onClick={() => setRating && setForm({ ...form, rating: i + 1 })}
        className={`h-5 w-5 cursor-pointer ${
          i < rating ? "text-yellow-400" : "text-gray-300"
        }`}
        fill={i < rating ? "currentColor" : "none"}
      />
    ));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be less than 5MB");
        return;
      }
      setForm({ ...form, photo: file });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please log in to leave a review.");

    setLoading(true);
    try {
      let photoURL = userReview?.photoUrl || "";

      // If a new photo is uploaded
      if (form.photo) {
        // 🔧 FIX: Updated storage path to include userId subfolder
        const timestamp = Date.now();
        const storageRef = ref(
          storage,
          `reviewImages/${user.uid}/${timestamp}-${form.photo.name}`
        );
        await uploadBytes(storageRef, form.photo);
        photoURL = await getDownloadURL(storageRef);
      }

      if (isEditing && userReview) {
        // Update existing review
        await updateDoc(doc(db, "reviews", userReview.id), {
          authorName: form.name,
          review: form.review,
          rating: form.rating,
          photoUrl: photoURL,
        });
      } else {
        // Add new review
        await addDoc(collection(db, "reviews"), {
          uid: user.uid,
          authorName: form.name || user.displayName || "Anonymous User",
          authorTitle: "Customer",
          review: form.review,
          rating: form.rating,
          photoUrl: photoURL,
          createdAt: new Date(),
        });
      }

      alert("Review submitted successfully!");
      setForm({ name: "", review: "", rating: 0, photo: null });
      setImagePreview(null);
      window.location.reload();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const current = reviews[currentIndex];
  const next = reviews[(currentIndex + 1) % reviews.length];

  return (
    <div className="bg-gray-50 py-16 px-6 md:px-12 text-center relative">
      <style>{styles}</style>

      <h2 className="text-3xl md:text-4xl font-bold text-orange-600 mb-6 animate-fadeIn">
        What Our Customers Say
      </h2>
      <p
        className="text-gray-600 max-w-3xl mx-auto mb-12 text-lg md:text-2xl animate-fadeIn"
        style={{ animationDelay: "0.2s" }}
      >
        Hear from those who have experienced our catering and fashion services.
      </p>

      {/* REVIEW CARDS */}
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white/70 rounded-2xl shadow-lg mx-auto w-[80%] md:w-[50%]">
          <p className="text-gray-600 text-lg font-medium mb-2">
            No reviews yet.
          </p>
          <p className="text-sm text-gray-500">
            Be the first to leave a review!
          </p>
        </div>
      ) : (
        <div className="relative flex justify-center items-center overflow-hidden h-[400px]">
          {/* Active Card */}
          <div
            className={`absolute transition-all duration-700 ease-in-out ${
              isSliding ? "slide-exit" : "z-20"
            } w-[80%] md:w-[50%] bg-white p-8 rounded-2xl shadow-xl mx-auto`}
          >
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden mb-6 border-4 border-orange-600 flex items-center justify-center bg-gray-50 relative">
                <Image
                  src={current.photoUrl || "/default-user.png"}
                  alt={current.authorName}
                  fill
                  sizes="(max-width: 768px) 96px, 96px"
                  className="object-cover"
                  priority
                />
              </div>
              <p className="text-gray-600 italic mb-4 text-lg">
                {current.review}
              </p>
              <div className="flex flex-col items-center">
                <div className="flex justify-center mb-2">
                  {renderStars(current.rating)}
                </div>
                <p className="text-gray-800 font-semibold text-lg">
                  {current.authorName}
                </p>
                <p className="text-sm text-gray-500">{current.authorTitle}</p>
              </div>
            </div>
          </div>

          {/* Next Card */}
          {next && (
            <div
              className={`absolute right-0 transition-transform duration-700 ${
                isSliding ? "slide-enter" : "half-visible"
              } w-[60%] md:w-[40%] bg-white p-6 rounded-2xl shadow-lg translate-x-[25%]`}
            >
              <div className="flex flex-col items-center opacity-80">
                <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-orange-600 flex items-center justify-center bg-gray-50 relative">
                  <Image
                    src={next.photoUrl || "/default-user.png"}
                    alt={next.authorName}
                    fill
                    sizes="(max-width: 768px) 80px, 80px"
                    className="object-cover"
                  />
                </div>
                <p className="text-sm italic text-gray-600 line-clamp-3">
                  {next.review}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REVIEW FORM */}
      <div className="mt-16 max-w-lg mx-auto bg-white rounded-2xl p-8 shadow-md">
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-gray-700 font-semibold mb-2"
              >
                Your Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Enter your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>

            {/* Review Textarea */}
            <textarea
              name="review"
              rows="4"
              placeholder="Write your review..."
              value={form.review}
              onChange={(e) => setForm({ ...form, review: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none"
              required
            />

            {/* Rating Stars */}
            <div>
              <p className="text-gray-700 font-semibold mb-2">Rating</p>
              <div className="flex justify-center gap-2">
                {renderStars(form.rating, true)}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-3">
                  <p className="text-gray-700 text-sm font-medium mb-2">
                    Preview:
                  </p>
                  <div className="relative w-full h-32 rounded-lg border border-gray-300 overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Review preview"
                      fill
                      sizes="(max-width: 768px) 100vw, 384px"
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading
                ? "Submitting..."
                : isEditing
                ? "Update Your Review"
                : "Submit Review"}
            </button>
          </form>
        ) : (
          <p className="text-gray-700">
            <a
              href="/login"
              className="text-orange-600 font-semibold hover:underline"
            >
              Login
            </a>{" "}
            to leave a review.
          </p>
        )}
      </div>
    </div>
  );
}
