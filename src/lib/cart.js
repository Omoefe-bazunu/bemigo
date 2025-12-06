"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebaseConfig";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { useState } from "react";

export function useCart() {
  const { user } = useAuth();
  const [error, setError] = useState(null);

  const addToCart = async (item) => {
    if (!user) {
      alert("Please log in to add items to your cart.");
      return;
    }

    try {
      const cartItemId = item.selectedSize
        ? `${item.id}-${item.selectedSize}`
        : item.id;

      const cartItemRef = doc(db, "users", user.uid, "cart", cartItemId);

      const cartData = {
        id: item.id,
        name: item.name,
        price: item.price,
        discountedPrice: item.discountedPrice || null,
        mainImageURL: item.mainImageURL || item.imageURL,
        selectedSize: item.selectedSize || null,
        quantity: item.quantity || 1,
        addedAt: new Date(),
      };

      await setDoc(cartItemRef, cartData, { merge: true });
      setError(null);
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError(err.message);
    }
  };

  // NEW: Only clear items that were just ordered
  const clearOrderedItems = async (orderedItems = []) => {
    if (!user || orderedItems.length === 0) return;

    try {
      const deletePromises = orderedItems.map(async (item) => {
        // Use the EXACT firestoreId from cart (e.g. "abc123-M")
        const cartItemId = item.firestoreId;

        if (!cartItemId) {
          console.warn("Missing firestoreId for item:", item);
          return;
        }

        const itemDoc = doc(db, "users", user.uid, "cart", cartItemId);
        await deleteDoc(itemDoc);
      });

      await Promise.all(deletePromises);
      console.log("Ordered items cleared from cart");
    } catch (err) {
      console.error("Error clearing cart:", err);
      throw err;
    }
  };

  return { addToCart, clearOrderedItems, error };
}
