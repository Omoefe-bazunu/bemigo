"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import ProductCard from "@/components/common/productcard";
import { Search, Filter, X } from "lucide-react";

const ITEMS_PER_PAGE = 20;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = async (loadMore = false) => {
    if (!loadMore) setLoading(true);
    else setLoadingMore(true);

    try {
      let q = query(
        collection(db, "products"),
        orderBy("createdAt", "desc"), // ← Most recent first
        limit(ITEMS_PER_PAGE)
      );

      if (loadMore && lastDoc) {
        q = query(
          collection(db, "products"),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(ITEMS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.().toISOString() || null,
      }));

      if (loadMore) {
        setProducts((prev) => [...prev, ...items]);
      } else {
        setProducts(items);
      }

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      setLastDoc(lastVisible);
      setHasMore(snapshot.docs.length === ITEMS_PER_PAGE);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const loadMore = () => fetchProducts(true);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = [
    "All",
    ...new Set(
      products.map((p) => p.category || "Uncategorized").filter(Boolean)
    ),
  ].sort();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-18 px-6">
        <div className="max-w-7xl mx-auto text-center mt-6">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            All Products
          </h1>
          <p className="text-xl opacity-90">
            Quality essentials, delivered to you
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="sticky top-0 z-40 bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-6 py-3.5 bg-gray-100 rounded-full font-medium"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Total Count */}
        {!loading && (
          <div className="mb-8 text-center">
            <p className="text-2xl font-bold text-gray-800">
              {filtered.length} {filtered.length === 1 ? "Product" : "Products"}
              {searchQuery || selectedCategory !== "All" ? ` found` : ` total`}
            </p>
          </div>
        )}

        {loading ? (
          <ProductGridSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {hasMore && !loading && (
          <div className="text-center mt-16">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-10 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full transition shadow-lg"
            >
              {loadingMore ? "Loading..." : "Load More Products"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Keep your skeleton and empty state
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse"
        >
          <div className="aspect-square bg-gray-200"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-24 h-24 text-gray-300 mx-auto mb-6">No products</div>
      <p className="text-2xl text-gray-600">No products found</p>
      <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
    </div>
  );
}
