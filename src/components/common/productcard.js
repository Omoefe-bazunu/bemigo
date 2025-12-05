// components/ProductCard.jsx
"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";

export default function ProductCard({ product }) {
  if (!product || !product.id) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
        <div className="aspect-square bg-gray-200"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const {
    id,
    name = "Unnamed Product",
    mainImageURL,
    price = 0,
    discountedPrice,
    originalPrice,
  } = product;

  // EXACTLY SAME LOGIC as /products page
  const displayPrice = discountedPrice
    ? Number(discountedPrice)
    : Number(price);
  const hasDiscount = originalPrice && displayPrice < Number(originalPrice);

  return (
    <Link href={`/products/${id}`} className="group block">
      <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden">
        {/* Image — EXACT same as /products */}
        <div className="relative aspect-square">
          <Image
            src={mainImageURL}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            unoptimized
          />
          {hasDiscount && (
            <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              SALE
            </span>
          )}
        </div>

        {/* Details — EXACT same as /products */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-orange-600 transition-colors">
            {name}
          </h3>

          <div className="mt-3 flex items-center justify-between">
            {hasDiscount ? (
              <div>
                <span className="text-xl font-bold text-orange-600">
                  ₦{displayPrice.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 line-through ml-2">
                  ₦{Number(originalPrice || price).toLocaleString()}
                </span>
              </div>
            ) : (
              <span className="text-xl font-bold text-gray-800">
                ₦{displayPrice.toLocaleString()}
              </span>
            )}
            <ShoppingBag className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}
