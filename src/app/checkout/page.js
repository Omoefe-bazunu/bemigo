"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/lib/cart";
import Image from "next/image";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { CreditCard, Upload, CheckCircle, X } from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const { clearOrderedItems } = useCart();

  const [form, setForm] = useState({
    name: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const total = cart.reduce((sum, item) => {
    const price = item.discountedPrice || item.price;
    return sum + price * item.quantity;
  }, 0);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchCart = async () => {
      const snapshot = await getDocs(collection(db, "users", user.uid, "cart"));
      const items = snapshot.docs.map((doc) => ({
        firestoreId: doc.id,
        ...doc.data(),
      }));
      setCart(items);
      setLoading(false);
    };
    fetchCart();
  }, [user, router]);

  const handleProofUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setProofFile(file);
    }
  };

  const uploadToBackend = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", `payment-proofs/${user.uid}`);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload-image`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Upload error:", errorData);
      throw new Error(
        `Upload failed: ${errorData.error || response.statusText}`
      );
    }

    const data = await response.json();
    return data.url;
  };

  const handlePayment = async () => {
    if (!proofFile) {
      toast.error("Please upload payment proof");
      return;
    }

    setUploading(true);
    toast.loading("Processing your order...");

    try {
      // Upload proof to backend (which uploads to Cloudinary)
      const proofURL = await uploadToBackend(proofFile);

      // Create order
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: user.uid,
        customerName: form.name,
        email: form.email,
        phone: form.phone,
        address: `${form.address}, ${form.city}, ${form.state} ${form.zip}`,
        items: cart.map((i) => ({
          productId: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.discountedPrice || i.price,
          image: i.mainImageURL || i.imageURL,
          selectedSize: i.selectedSize || null,
        })),
        totalAmount: total,
        paymentProof: proofURL,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Clear the items that were just ordered
      await clearOrderedItems(
        cart.map((item) => ({ firestoreId: item.firestoreId }))
      );

      // Send email
      await fetch("/api/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderRef.id,
          customerName: form.name,
          email: form.email,
          phone: form.phone,
          address: `${form.address}, ${form.city}, ${form.state} ${form.zip}`,
          total,
          items: cart.map((i) => ({
            name: i.name,
            qty: i.quantity,
            price: i.discountedPrice || i.price,
          })),
          proofURL,
        }),
      });

      toast.dismiss();
      toast.success("Order placed successfully!");
      setShowPaymentModal(false);
      router.push("/orders");
    } catch (err) {
      console.error("Checkout failed:", err);
      toast.dismiss();
      toast.error("Order failed. Your cart is safe.");
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CreditCard className="w-16 h-16 text-orange-600 animate-pulse" />
      </div>
    );
  if (cart.length === 0) return <EmptyCart />;

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gray-50 py-25 px-4  relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 bg-orange-600 rounded-3xl py-10 px-6 shadow-xl">
            <h1 className="text-4xl md:text-5xl font-extrabold text-center text-white">
              Checkout
            </h1>
            <p className="text-gray-50 text-lg">
              Complete your order details below and proceed to payment.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Order Summary */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                Order Summary
              </h2>
              <div className="space-y-5">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden">
                      <Image
                        src={item.mainImageURL || item.imageURL}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-orange-600 font-bold">
                        ₦
                        {(
                          (item.discountedPrice || item.price) * item.quantity
                        ).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-gray-600">× {item.quantity}</span>
                  </div>
                ))}
                <div className="pt-6 text-2xl font-bold flex justify-between">
                  <span>Total</span>
                  <span className="text-orange-600">
                    ₦{total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping & Payment */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6">Shipping Details</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowPaymentModal(true);
                }}
                className="space-y-5"
              >
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-5 py-4 border rounded-xl"
                />
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className="w-full px-5 py-4 border rounded-xl bg-gray-100"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  className="w-full px-5 py-4 border rounded-xl"
                />
                <textarea
                  placeholder="Full Delivery Address"
                  rows={3}
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  required
                  className="w-full px-5 py-4 border rounded-xl"
                />
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    required
                    className="px-5 py-4 border rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                    required
                    className="px-5 py-4 border rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={form.zip}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                    required
                    className="px-5 py-4 border rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xl py-5 rounded-2xl transition shadow-lg flex items-center justify-center gap-3"
                >
                  <CreditCard className="w-6 h-6" />
                  Proceed to Payment
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto my-8 max-h-screen overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white rounded-t-3xl p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Complete Payment
                </h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-500 hover:text-gray-800 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Bank Details */}
              <div className="bg-orange-50 p-6 rounded-2xl text-center">
                <p className="text-lg font-bold mb-4 text-orange-700">
                  Pay to:
                </p>
                <div className="bg-white p-5 rounded-xl shadow-inner space-y-3 text-left">
                  <p className="font-medium">
                    <span className="text-gray-600">Bank:</span> United Bank of
                    Africa (UBA)
                  </p>
                  <p className="font-medium">
                    <span className="text-gray-600">Name:</span> Jennifer
                    Ajemigbitse
                  </p>
                  <p className="font-medium">
                    <span className="text-gray-600">Account:</span> 2308959444
                  </p>
                </div>
                <p className="mt-5 text-3xl font-bold text-orange-600">
                  ₦{total.toLocaleString()}
                </p>
              </div>

              {/* Upload Proof */}
              <div>
                <label className="block text-lg font-medium text-gray-800 mb-3">
                  Upload Payment Proof
                </label>
                <div className="border-2 border-dashed border-orange-300 rounded-2xl p-10 text-center hover:border-orange-500 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProofUpload}
                    className="hidden"
                    id="proof-upload"
                  />
                  <label htmlFor="proof-upload" className="cursor-pointer">
                    {proofFile ? (
                      <div className="space-y-3">
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                        <p className="font-semibold text-gray-800">
                          {proofFile.name}
                        </p>
                        <p className="text-sm text-gray-500">Tap to change</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-16 h-16 text-orange-600 mx-auto" />
                        <p className="text-orange-600 font-semibold text-lg">
                          Click to upload screenshot
                        </p>
                        <p className="text-sm text-gray-500">
                          JPG, PNG up to 5MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handlePayment}
                disabled={uploading || !proofFile}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold text-xl py-5 rounded-2xl transition shadow-lg flex items-center justify-center gap-3"
              >
                {uploading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    Submit Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EmptyCart() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center bg-white p-12 rounded-3xl shadow-xl">
        <div className="w-20 h-20 text-gray-400 mx-auto mb-6">Package</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Cart is Empty</h2>
        <Link href="/">
          <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-10 rounded-full">
            Shop Now
          </button>
        </Link>
      </div>
    </div>
  );
}
