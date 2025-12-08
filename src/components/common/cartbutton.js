"use client";
import { useCart } from "@/lib/cart";
import { useState } from "react";

export function AddToCartButton({ item }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(item.sizes?.[0] || ""); // Default to the first size if available

  const handleAddToCart = () => {
    // For fashion items, ensure a size is selected
    if (item.type === "fashion" && !selectedSize) {
      alert("Please select a size.");
      return;
    }

    // Add the item to the cart, including selectedSize only for fashion items
    const cartItem = {
      ...item,
      selectedSize: item.type === "fashion" ? selectedSize : null,
    };
    addToCart(cartItem);

    // Show alert with size for fashion items, without size for catering items
    if (item.type === "fashion") {
      alert(
        `${item.name} (Size: ${selectedSize}) has been added to your cart!`
      );
    } else {
      alert(`${item.name} has been added to your cart!`);
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Size Selector (only for fashion items) */}
      {item.type === "fashion" && item.sizes && (
        <div className="flex items-center gap-2">
          <label htmlFor="size" className="text-gray-700 font-semibold">
            Size:
          </label>
          <select
            id="size"
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-800"
          >
            {item.sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        className="px-6 py-3 w-36 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
      >
        Add to Cart
      </button>
    </div>
  );
}
