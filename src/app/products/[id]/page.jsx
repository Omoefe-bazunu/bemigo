"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import {
  ShoppingBag,
  Star,
  Send,
  CheckCircle,
  Plus,
  Minus,
  Check,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function ProductDetailPage({ params }) {
  const { id } = use(params);
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      const docSnap = await getDoc(doc(db, "products", id));
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() });
      }

      const reviewsSnap = await getDocs(
        query(
          collection(db, "products", id, "reviews"),
          orderBy("createdAt", "desc")
        )
      );
      const fetchedReviews = reviewsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));
      setReviews(fetchedReviews);

      if (user) {
        const userReview = fetchedReviews.find((r) => r.userId === user.uid);
        if (userReview) {
          setHasReviewed(true);
          setRating(userReview.rating);
          setReviewText(userReview.text);
        }
      }

      setLoading(false);
    };
    fetchData();
  }, [id, user]);

  const addToCart = async () => {
    if (!user) {
      toast.error("Please log in to add items");
      return;
    }
    if (!product || product.qty < quantity) {
      toast.error("Not enough stock!");
      return;
    }

    setAddingToCart(true);
    try {
      const cartRef = collection(db, "users", user.uid, "cart");
      const q = query(cartRef, where("id", "==", product.id));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const existing = snapshot.docs[0];
        await deleteDoc(existing.ref);
        await addDoc(cartRef, {
          ...existing.data(),
          quantity: existing.data().quantity + quantity,
        });
      } else {
        await addDoc(cartRef, {
          id: product.id,
          name: product.name,
          price: product.discountedPrice || product.price,
          discountedPrice: product.discountedPrice || null,
          mainImageURL: product.mainImageURL,
          quantity,
          addedAt: new Date(),
        });
      }

      toast.success("Added to cart!");
    } catch (err) {
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const submitReview = async () => {
    if (!user) return toast.error("Login required");
    if (rating === 0) return toast.error("Select a rating");
    if (!reviewText.trim()) return toast.error("Write a review");

    setSubmitting(true);
    try {
      await addDoc(collection(db, "products", id, "reviews"), {
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        rating,
        text: reviewText.trim(),
        createdAt: serverTimestamp(),
      });
      toast.success("Review submitted!");
      setHasReviewed(true);
    } catch (err) {
      toast.error("Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, readonly = false }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly || submitting}
          onClick={() => !readonly && onChange(star)}
          className="transition hover:scale-110"
        >
          <Star
            className={`w-7 h-7 ${
              star <= value
                ? "fill-orange-400 text-orange-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );

  if (loading) return <ProductDetailSkeleton />;
  if (!product)
    return <div className="text-center py-20 text-2xl">Product not found</div>;

  const images = [
    product.mainImageURL,
    ...(product.supplementaryImageURLs || []),
  ];
  const finalPrice = product.discountedPrice || product.price;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gray-50 py-25 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images */}
            <div>
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl bg-white">
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 mt-6 flex-wrap">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative w-24 h-24 rounded-xl overflow-hidden border-4 transition-all ${
                        selectedImage === i
                          ? "border-orange-600 shadow-lg"
                          : "border-gray-200"
                      }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3 mt-3">
                  <StarRating value={avgRating} readonly />
                  <span className="text-gray-600">
                    ({reviews.length} reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                {product.discountedPrice ? (
                  <>
                    <span className="text-5xl font-bold text-orange-600">
                      ₦{Number(product.discountedPrice).toLocaleString()}
                    </span>
                    <span className="text-3xl text-gray-500 line-through">
                      ₦
                      {Number(
                        product.originalPrice || product.price
                      ).toLocaleString()}
                    </span>
                    <span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold">
                      SALE
                    </span>
                  </>
                ) : (
                  <span className="text-5xl font-bold text-gray-800">
                    ₦{Number(product.price).toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-lg text-gray-700 leading-relaxed">
                {product.description}
              </p>

              {/* Specifications */}
              {product.specifications && (
                <div className="bg-gray-100 p-6 rounded-2xl">
                  <h3 className="font-bold text-xl mb-4">Specifications</h3>
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {product.specifications}
                  </div>
                </div>
              )}

              {/* Stock */}
              <div className="flex items-center gap-3 text-lg">
                <Check className="w-6 h-6 text-green-600" />
                <span className="font-medium">
                  {product.availability} —{" "}
                  <span className="text-green-600">
                    {product.qty} available
                  </span>
                </span>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-6">
                <span className="text-lg font-medium">Quantity:</span>
                <div className="flex items-center border-2 border-gray-300 rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 rounded-full transition"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="px-8 font-bold text-xl">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.qty, quantity + 1))
                    }
                    className="p-3 hover:bg-gray-100 rounded-full transition"
                    disabled={quantity >= product.qty}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={addToCart}
                disabled={addingToCart || product.qty === 0}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold text-xl py-6 rounded-2xl flex items-center justify-center gap-4 shadow-xl transition"
              >
                {addingToCart ? (
                  "Adding..."
                ) : (
                  <>
                    <ShoppingBag className="w-8 h-8" />
                    Add to Cart
                  </>
                )}
              </button>

              {/* Reviews Section */}
              <div className="border-t pt-10">
                <h2 className="text-3xl font-bold mb-8">Customer Reviews</h2>

                {/* Write Review */}
                {user && !hasReviewed && (
                  <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
                    <h3 className="text-xl font-bold mb-4">Write a Review</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium mb-2">Your Rating</p>
                        <StarRating value={rating} onChange={setRating} />
                      </div>
                      <textarea
                        rows={4}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your experience..."
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        onClick={submitReview}
                        disabled={submitting}
                        className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-3"
                      >
                        <Send className="w-5 h-5" />
                        Submit Review
                      </button>
                    </div>
                  </div>
                )}

                {/* Review List */}
                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No reviews yet. Be the first!
                    </p>
                  ) : (
                    reviews.map((r) => (
                      <div
                        key={r.id}
                        className="bg-white p-6 rounded-2xl shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold">{r.userName}</p>
                            <StarRating value={r.rating} readonly />
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Intl.DateTimeFormat("en-NG").format(
                              r.createdAt
                            )}
                          </p>
                        </div>
                        <p className="mt-4 text-gray-700">{r.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="aspect-square bg-gray-200 rounded-3xl animate-pulse"></div>
        <div className="space-y-8">
          <div className="h-16 bg-gray-200 rounded-2xl animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded-2xl animate-pulse w-48"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-4 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
