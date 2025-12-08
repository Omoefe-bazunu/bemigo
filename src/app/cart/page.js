"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { ShoppingBag, Trash2, Plus, Minus, Package } from "lucide-react";

const ConfirmationModal = ({ item, onConfirm, onCancel }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold text-gray-800 mb-3">Remove Item?</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to remove{" "}
          <span className="font-semibold">&quot;{item.name}&quot;</span>
          {item.selectedSize && ` (Size: ${item.selectedSize})`} from your cart?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(item.firestoreId)}
            className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CartPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemToRemove, setItemToRemove] = useState(null);
  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  useEffect(() => {
    if (user === null) {
      router.push("/login");
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    const cartRef = collection(db, "users", user.uid, "cart");
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        firestoreId: doc.id,
        ...doc.data(),
      }));
      setCart(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, router]);

  const totalPrice = cart.reduce((sum, item) => {
    const price = item.discountedPrice || item.price;
    return sum + price * item.quantity;
  }, 0);

  const updateQuantity = async (id, newQty) => {
    if (newQty < 1) return;
    await updateDoc(doc(db, "users", user.uid, "cart", id), {
      quantity: newQty,
    });
  };

  const removeItem = async (id) => {
    await deleteDoc(doc(db, "users", user.uid, "cart", id));
    setItemToRemove(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-orange-600">
          <ShoppingBag className="w-12 h-12 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-25 px-4">
      <div className="max-w-4xl mx-auto ">
        <div className="text-center mb-12 bg-orange-600 rounded-3xl py-10 px-6 shadow-xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center text-white">
            Your Cart
          </h1>
          <p className="text-gray-50 text-lg">
            Here are the list of items you have added to your cart
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <p className="text-xl text-gray-600 mb-8">Your cart is empty</p>
            <Link href="/products">
              <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-10 rounded-full transition">
                Continue Shopping
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.firestoreId}
                  className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row items-center gap-6 hover:shadow-xl transition"
                >
                  <div className="relative w-28 h-28 flex-shrink-0">
                    <Image
                      src={item.mainImageURL || item.imageURL}
                      alt={item.name}
                      fill
                      className="object-cover rounded-xl"
                    />
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-gray-800">
                      {item.name}
                    </h3>
                    {item.selectedSize && (
                      <p className="text-gray-500">Size: {item.selectedSize}</p>
                    )}
                    <p className="text-2xl font-bold text-orange-600 mt-2">
                      ₦
                      {formatNumber(
                        (item.discountedPrice || item.price) * item.quantity
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-full">
                      <button
                        onClick={() =>
                          updateQuantity(item.firestoreId, item.quantity - 1)
                        }
                        className="p-3 hover:bg-gray-100 rounded-full transition"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="px-6 font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.firestoreId, item.quantity + 1)
                        }
                        className="p-3 hover:bg-gray-100 rounded-full transition"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    <button
                      onClick={() => setItemToRemove(item)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-full transition"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 bg-white rounded-3xl shadow-xl p-8">
              <div className="flex justify-between text-2xl font-bold text-gray-800 mb-8">
                <span>Total</span>
                <span className="text-orange-600">
                  ₦{formatNumber(totalPrice)}
                </span>
              </div>

              <Link href="/checkout" className="block">
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xl py-5 rounded-2xl transition shadow-lg">
                  Proceed to Checkout
                </button>
              </Link>
            </div>
          </>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          item={itemToRemove}
          onConfirm={removeItem}
          onCancel={() => setItemToRemove(null)}
        />
      </div>
    </div>
  );
}
