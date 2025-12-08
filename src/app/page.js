"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import Button from "@/components/common/buttons";
import ProductCard from "@/components/common/productcard";
import AboutUs from "@/components/about-us";
import CustomerReviews from "@/components/customer-reviews";
import ContactUs from "@/components/contact-us";

export default function Home() {
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "products"),
      orderBy("createdAt", "desc"),
      limit(6)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const products = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          };
        });
        setRecentProducts(products);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe(); // cleanup on unmount
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url('/beee.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative max-w-7xl mx-auto pt-35 pb-20 px-6 text-center">
          <p className="text-lg text-gray-200 mb-4">Welcome to</p>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
            <span className="text-blue-600">Bemigo</span> Enterprises
          </h1>
          <p className="text-lg md:text-2xl text-gray-200 max-w-2xl mx-auto mb-8">
            Your One-stop shop for quality and affordable essentials.
          </p>
          <Button
            href="/products"
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-4 rounded-lg text-xl"
          >
            Shop Now
          </Button>
        </div>
      </section>

      <AboutUs />

      {/* Latest Products – Real-time */}
      <section className="py-16 px-6 bg-white">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-orange-600">
          Latest Products
        </h2>

        {loading ? (
          <p className="text-center text-gray-600 py-12">Loading products...</p>
        ) : recentProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {recentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 py-12">
            No products available yet.
          </p>
        )}

        <div className="text-center mt-12">
          <Button
            href="/products"
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-12 py-5 rounded-full text-xl shadow-lg"
          >
            See All Products
          </Button>
        </div>
      </section>

      {/* Bulk Orders */}
      <section className="py-20 px-6 bg-gradient-to-r from-orange-700 to-orange-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
            Are you a Bulk Buyer?
          </h2>
          <p className="text-lg md:text-xl mb-10 opacity-95">
            Get special wholesale prices and dedicated support.
          </p>
          <a
            href="https://wa.me/2349126939069?text=Hello%20Bemigo%20Team!%20I%27m%20interested%20in%20bulk%20purchase."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-orange-700 font-bold px-10 py-5 rounded-full text-lg hover:bg-gray-100 transition"
          >
            Contact Sales on WhatsApp
          </a>
        </div>
      </section>

      <CustomerReviews />
      <ContactUs />
    </div>
  );
}
