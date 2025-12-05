// app/product/[id]/page.jsx
"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import {
  ShoppingBag,
  Check,
  Truck,
  Shield,
  Star,
  Plus,
  Minus,
} from "lucide-react";

export default function ProductDetailPage({ params }) {
  // Safely unwrap params using React.use() — fixes Next.js 15 warning
  const { id } = use(params);

  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, "products", id));
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    if (!user) {
      alert("Please log in to add items to cart");
      return;
    }
    if (product.qty < quantity) {
      alert("Not enough stock!");
      return;
    }

    setAdding(true);
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

      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <ProductDetailSkeleton />;
  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl text-gray-600">Product not found</p>
      </div>
    );

  const images = [
    product.mainImageURL,
    ...(product.supplementaryImageURLs || []),
  ];
  const finalPrice = product.discountedPrice || product.price;

  return (
    <div className="min-h-screen bg-gray-50 py-25 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
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

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
                {product.name}
              </h1>
              <p className="text-xl text-gray-600 mt-2">{product.category}</p>
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
                  <span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-lg">
                    SALE
                  </span>
                </>
              ) : (
                <span className="text-5xl font-bold text-gray-800">
                  ₦{Number(product.price).toLocaleString()}
                </span>
              )}
            </div>

            <div className="prose prose-lg text-gray-700">
              <p className="leading-relaxed">{product.description}</p>
            </div>

            {product.specifications && (
              <div className="bg-gray-100 p-6 rounded-2xl">
                <h3 className="font-bold text-xl mb-4">Specifications</h3>
                <div className="text-gray-700 whitespace-pre-wrap font-sans">
                  {product.specifications}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-lg">
              <Check className="w-6 h-6 text-green-600" />
              <span className="font-medium">
                In Stock —{" "}
                <span className="text-green-600">{product.qty} available</span>
              </span>
            </div>

            {/* Quantity Selector */}
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
                  onClick={() => setQuantity(quantity + 1)}
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
              disabled={adding || product.qty === 0}
              className={`w-full py-6 rounded-2xl font-bold text-xl transition-all flex items-center justify-center gap-4 shadow-xl ${
                added
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400"
              } text-white`}
            >
              {added ? (
                <>
                  <Check className="w-8 h-8" />
                  Added to Cart!
                </>
              ) : adding ? (
                "Adding to Cart..."
              ) : (
                <>
                  <ShoppingBag className="w-8 h-8" />
                  Add to Cart
                </>
              )}
            </button>

            {/* WhatsApp Order */}
            <a
              href={`https://wa.me/2349126939069?text=${encodeURIComponent(
                `Hi! I'd like to order:\n\n${quantity} × ${
                  product.name
                }\nTotal: ₦${(finalPrice * quantity).toLocaleString()}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-orange-600 font-semibold hover:underline mt-4 text-lg"
            >
              Or order directly via WhatsApp
            </a>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t">
              <div className="text-center">
                <Truck className="w-12 h-12 mx-auto text-orange-600 mb-2" />
                <p className="font-semibold">Fast Delivery</p>
              </div>
              <div className="text-center">
                <Shield className="w-12 h-12 mx-auto text-orange-600 mb-2" />
                <p className="font-semibold">Secure Shopping</p>
              </div>
              <div className="text-center">
                <Star className="w-12 h-12 mx-auto text-orange-600 mb-2" />
                <p className="font-semibold">Quality Guaranteed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
