"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "products"));
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setProducts(data);
    setLoading(false);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name || "",
      category: p.category || "",
      description: p.description || "",
      specifications: p.specifications || "",
      price: p.discountedPrice ? "" : p.price || "",
      originalPrice: p.originalPrice || "",
      discountedPrice: p.discountedPrice || "",
      availability: p.availability || "InStock",
      qty: p.qty || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id) => {
    const finalPrice = editForm.discountedPrice
      ? Number(editForm.discountedPrice)
      : Number(editForm.price);

    const updateData = {
      name: editForm.name,
      category: editForm.category,
      description: editForm.description,
      specifications: editForm.specifications || null,
      price: finalPrice,
      availability: editForm.availability,
      qty: Number(editForm.qty),
    };

    if (editForm.originalPrice && editForm.discountedPrice) {
      updateData.originalPrice = Number(editForm.originalPrice);
      updateData.discountedPrice = Number(editForm.discountedPrice);
    }

    await updateDoc(doc(db, "products", id), updateData);
    await fetchProducts();
    cancelEdit();
  };

  const removeProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    await deleteDoc(doc(db, "products", id));
    setProducts(products.filter((p) => p.id !== id));
  };

  if (loading) return <p className="p-4 text-center">Loading...</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Manage Products</h2>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">No products yet.</p>
      ) : (
        <div className="space-y-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              {editingId === p.id ? (
                /* EDIT MODE */
                <div className="p-5 space-y-4">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg"
                    placeholder="Product Name"
                  />
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg"
                    placeholder="Category"
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border rounded-lg"
                    placeholder="Description"
                  />
                  <textarea
                    value={editForm.specifications}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        specifications: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full px-4 py-3 border rounded-lg"
                    placeholder="Specifications (optional)"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={editForm.originalPrice}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          originalPrice: e.target.value,
                        })
                      }
                      placeholder="Original Price"
                      className="px-4 py-3 border rounded-lg"
                    />
                    <input
                      type="number"
                      value={editForm.discountedPrice || editForm.price}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          discountedPrice: editForm.originalPrice
                            ? e.target.value
                            : "",
                          price: editForm.originalPrice ? "" : e.target.value,
                        })
                      }
                      placeholder="Sale/Final Price"
                      className="px-4 py-3 border rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={editForm.availability}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          availability: e.target.value,
                        })
                      }
                      className="px-4 py-3 border rounded-lg"
                    >
                      <option value="InStock">In Stock</option>
                      <option value="OutOfStock">Out of Stock</option>
                    </select>
                    <input
                      type="number"
                      value={editForm.qty}
                      onChange={(e) =>
                        setEditForm({ ...editForm, qty: e.target.value })
                      }
                      placeholder="Quantity"
                      className="px-4 py-3 border rounded-lg"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => saveEdit(p.id)}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* VIEW MODE */
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-32 h-32">
                    <Image
                      src={p.mainImageURL}
                      alt={p.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 p-5">
                    <h3 className="text-lg font-bold">{p.name}</h3>
                    <p className="text-sm text-gray-600">{p.category}</p>
                    <p className="mt-2 text-gray-700 line-clamp-2">
                      {p.description}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      {p.discountedPrice ? (
                        <>
                          <span className="text-xl font-bold text-red-600">
                            ${p.discountedPrice}
                          </span>
                          <span className="text-gray-500 line-through">
                            ${p.originalPrice}
                          </span>
                        </>
                      ) : (
                        <span className="text-xl font-bold">${p.price}</span>
                      )}
                    </div>
                    <p className="text-sm mt-1">
                      Stock: {p.qty} | {p.availability}
                    </p>
                  </div>
                  <div className="p-5 flex sm:flex-col gap-3">
                    <button
                      onClick={() => startEdit(p)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeProduct(p.id)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
