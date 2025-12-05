"use client";
import { useState } from "react";
import Image from "next/image";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebaseConfig";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Upload } from "lucide-react";

const MAX_IMAGES = 3;

// Sortable Image Component
function SortableImage({ id, url, index, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50">
        <Image src={url} alt="" fill className="object-cover" />
        <div
          className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
            index === 0 ? "bg-orange-600" : "bg-gray-700"
          }`}
        >
          {index === 0 ? "MAIN" : `EXTRA ${index}`}
        </div>
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 bg-black/60 p-2 rounded-lg cursor-move opacity-0 group-hover:opacity-100 transition"
        >
          <GripVertical className="w-5 h-5 text-white" />
        </div>
        <button
          onClick={() => onRemove(id)}
          className="absolute bottom-2 right-2 bg-red-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition"
        >
          <Trash2 className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}

export default function AddProductForm() {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    specifications: "",
    price: "",
    originalPrice: "",
    discountedPrice: "",
    availability: "InStock",
    qty: "",
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > MAX_IMAGES) {
      alert(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }
    const newImages = files.map((file) => ({
      id: Math.random().toString(36),
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id) =>
    setImages((prev) => prev.filter((img) => img.id !== id));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setImages((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const formatPrice = (num) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(num || 0);
  };

  const validateForm = () => {
    const err = {};
    if (!formData.name.trim()) err.name = "Product name is required";
    if (!formData.category.trim()) err.category = "Category is required";
    if (images.length === 0) err.images = "At least one image required";
    if (!formData.description.trim())
      err.description = "Description is required";
    if (!formData.price && !formData.discountedPrice)
      err.price = "Price is required";
    if (!formData.qty || formData.qty <= 0) err.qty = "Valid quantity required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const urls = [];
      for (const img of images) {
        const storageRef = ref(
          storage,
          `products/${Date.now()}-${img.file.name}`
        );
        await uploadBytes(storageRef, img.file);
        urls.push(await getDownloadURL(storageRef));
      }

      const finalPrice = formData.discountedPrice
        ? Number(formData.discountedPrice)
        : Number(formData.price);

      await addDoc(collection(db, "products"), {
        name: formData.name.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
        specifications: formData.specifications.trim() || null,
        mainImageURL: urls[0],
        supplementaryImageURLs: urls.slice(1),
        price: finalPrice,
        ...(formData.originalPrice &&
          formData.discountedPrice && {
            originalPrice: Number(formData.originalPrice),
            discountedPrice: Number(formData.discountedPrice),
          }),
        availability: formData.availability,
        qty: Number(formData.qty),
        createdAt: serverTimestamp(),
      });

      alert("Product added successfully!");

      // Reset form
      setFormData({
        name: "",
        category: "",
        description: "",
        specifications: "",
        price: "",
        originalPrice: "",
        discountedPrice: "",
        availability: "InStock",
        qty: "",
      });
      setImages([]);
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-2xl">
      <h2 className="text-3xl font-bold text-center mb-10 text-orange-600">
        Add New Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Images */}
        <div>
          <label className="block text-lg font-semibold mb-4">
            Product Images (Drag to reorder — First = Main)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-full file:bg-orange-600 file:text-white hover:file:bg-orange-700"
            disabled={images.length >= MAX_IMAGES}
          />
          {images.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={images.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-3 gap-6 mt-6">
                  {images.map((img, i) => (
                    <SortableImage
                      key={img.id}
                      id={img.id}
                      url={img.preview}
                      index={i}
                      onRemove={removeImage}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
          {errors.images && (
            <p className="text-red-600 text-sm mt-2">{errors.images}</p>
          )}
        </div>

        {/* Name & Category */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-2">Product Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500"
              placeholder="e.g. 3in1 Vacuum Flask"
              required
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-2">Category *</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500"
              placeholder="e.g. Edibles, Fashion, Electronics"
              required
            />
            {errors.category && (
              <p className="text-red-600 text-sm mt-1">{errors.category}</p>
            )}
          </div>
        </div>

        {/* Price Fields */}
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block font-medium mb-2">
              Regular Price (₦) *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="w-full px-4 py-3 border rounded-xl"
              placeholder="15000"
              required={!formData.discountedPrice}
            />
          </div>
          <div>
            <label className="block font-medium mb-2">Original Price (₦)</label>
            <input
              type="number"
              value={formData.originalPrice}
              onChange={(e) =>
                setFormData({ ...formData, originalPrice: e.target.value })
              }
              className="w-full px-4 py-3 border rounded-xl"
              placeholder="20000"
            />
          </div>
          <div>
            <label className="block font-medium mb-2">
              Discounted Price (₦)
            </label>
            <input
              type="number"
              value={formData.discountedPrice}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  discountedPrice: e.target.value,
                  price: "",
                });
              }}
              className="w-full px-4 py-3 border rounded-xl"
              placeholder="12000 (optional)"
            />
          </div>
        </div>

        {/* Live Price Preview */}
        {(formData.price || formData.discountedPrice) && (
          <div className="bg-orange-50 p-6 rounded-xl text-center">
            <p className="text-sm text-gray-600">Customer sees:</p>
            <p className="text-3xl font-bold text-orange-600">
              {formatPrice(formData.discountedPrice || formData.price)}
            </p>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block font-medium mb-2">Description *</label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-4 py-3 border rounded-xl"
            placeholder="Describe your product..."
            required
          />
        </div>

        {/* Specifications */}
        <div>
          <label className="block font-medium mb-2">
            Specifications (Optional)
          </label>
          <textarea
            rows={3}
            value={formData.specifications}
            onChange={(e) =>
              setFormData({ ...formData, specifications: e.target.value })
            }
            className="w-full px-4 py-3 border rounded-xl"
            placeholder="Color: Grey, Material: Ceramic..."
          />
        </div>

        {/* Stock */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-2">Availability *</label>
            <select
              value={formData.availability}
              onChange={(e) =>
                setFormData({ ...formData, availability: e.target.value })
              }
              className="w-full px-4 py-3 border rounded-xl"
            >
              <option value="InStock">In Stock</option>
              <option value="OutOfStock">Out of Stock</option>
              <option value="PreOrder">Pre-Order</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-2">
              Quantity in Stock *
            </label>
            <input
              type="number"
              value={formData.qty}
              onChange={(e) =>
                setFormData({ ...formData, qty: e.target.value })
              }
              className="w-full px-4 py-3 border rounded-xl"
              min="1"
              required
            />
            {errors.qty && (
              <p className="text-red-600 text-sm mt-1">{errors.qty}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || images.length === 0}
          className="w-full py-5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold text-xl rounded-2xl transition shadow-lg flex items-center justify-center gap-3"
        >
          {loading ? (
            "Saving Product..."
          ) : (
            <>
              <Upload className="w-6 h-6" />
              Add Product
            </>
          )}
        </button>
      </form>
    </div>
  );
}
