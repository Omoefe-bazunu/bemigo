"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import Image from "next/image";
import { ChevronDown, CheckCircle, XCircle, Mail } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    toast.loading("Updating order...");

    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });

      // Send email to customer
      await fetch("/api/send-status-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          customerEmail: orders.find((o) => o.id === orderId)?.email,
          customerName: orders.find((o) => o.id === orderId)?.customerName,
        }),
      });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast.dismiss();
      toast.success(`Order marked as ${newStatus}! Email sent.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order");
    } finally {
      setUpdating(null);
    }
  };

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  const formatDate = (date) =>
    new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);

  const getStatusBadge = (status) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      fulfilled: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
    };
    return `px-4 py-2 w-full rounded-full text-sm font-bold border ${
      map[status] || "bg-gray-100 text-gray-800"
    }`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-orange-600">
          <Mail className="w-12 h-12 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-extrabold text-center text-orange-600 mb-12">
            Admin — All Orders
          </h1>

          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl p-16 text-center">
              <Mail className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <p className="text-2xl text-gray-600">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition"
                >
                  {/* Header */}
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center flex-col ">
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-gray-800">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {order.customerName} • {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`mt-2 text-left ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-8">
                      <p className="text-2xl font-bold text-orange-600">
                        ₦{order.totalAmount.toLocaleString()}
                      </p>
                      <ChevronDown
                        className={`w-6 h-6 transition-transform ${
                          expandedId === order.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expandedId === order.id && (
                    <div className="border-t p-6 bg-gray-50 space-y-6">
                      {/* Items */}
                      <div>
                        <h4 className="font-bold text-lg mb-4">Items</h4>
                        <div className="space-y-3">
                          {order.items.map((item, i) => (
                            <div
                              key={i}
                              className="flex gap-4 bg-white p-4 rounded-2xl"
                            >
                              <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-600">
                                  ₦{item.price.toLocaleString()} ×{" "}
                                  {item.quantity}
                                </p>
                              </div>
                              <p className="font-bold">
                                ₦{(item.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold mb-2">Customer</h4>
                          <p>{order.customerName}</p>
                          <p className="text-blue-600">{order.email}</p>
                          <p>{order.phone}</p>
                        </div>
                        <div>
                          <h4 className="font-bold mb-2">Delivery Address</h4>
                          <p className="text-gray-700">{order.address}</p>
                        </div>
                      </div>

                      {/* Payment Proof */}
                      {order.paymentProof && (
                        <div>
                          <h4 className="font-bold mb-2">Payment Proof</h4>
                          <a
                            href={order.paymentProof}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-600 hover:underline font-medium"
                          >
                            View Screenshot
                          </a>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {order.status === "pending" && (
                        <div className="flex gap-4 flex-col md:flex-row pt-6 border-t">
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "fulfilled")
                            }
                            disabled={updating === order.id}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-3"
                          >
                            <CheckCircle className="w-6 h-6" />
                            Mark as Fulfilled
                          </button>
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "rejected")
                            }
                            disabled={updating === order.id}
                            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-3"
                          >
                            <XCircle className="w-6 h-6" />
                            Reject Order
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
