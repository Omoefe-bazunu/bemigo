"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
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
      // Create a unique ID for the cart item (combine product ID and size if applicable)
      const cartItemId = item.selectedSize
        ? `${item.id}-${item.selectedSize}`
        : item.id;

      // Reference to the cart item in Firestore
      const cartItemRef = doc(db, "users", user.uid, "cart", cartItemId);

      // Check if item already exists in cart
      const cartData = {
        id: item.id,
        name: item.name,
        price: item.price,
        discountedPrice: item.discountedPrice || null,
        imageURL: item.imageURL,
        type: item.type,
        selectedSize: item.selectedSize || null,
        quantity: 1, // Default quantity
      };

      // Use setDoc with merge: true to add or update the item
      // If item exists, we'll increment quantity separately
      await setDoc(cartItemRef, cartData, { merge: true });

      setError(null);
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError(err.message);
      alert("Failed to add item to cart. Please try again.");
    }
  };

  return { addToCart, error };
}
