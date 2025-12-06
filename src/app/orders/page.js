"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import Image from "next/image";
import {
  ChevronDown,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        }));
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace("/login"); // ← Forces redirect
    }
  }, [user, router]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      fulfilled: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
      default: "bg-gray-100 text-gray-800 border-gray-300",
    };
    const s = styles[status] || styles.default;
    return `px-4 py-2 rounded-full text-sm font-bold border ${s}`;
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Package className="w-12 h-12 text-orange-600 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-25 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 bg-orange-600 rounded-3xl py-10 px-6 shadow-xl">
          <h1 className="text-5xl font-extrabold text-white mb-4">My Orders</h1>
          <p className="text-gray-50 text-lg">
            Track your purchases and payment status
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-16 text-center">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No Orders Yet
            </h2>
            <p className="text-gray-600 mb-8">
              Start shopping and place your first order!
            </p>
            <Link href="/products">
              <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-10 rounded-full transition shadow-lg">
                Shop Now
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl"
              >
                {/* Order Header */}
                <button
                  onClick={() => toggleExpand(order.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-6">
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-800">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span className={getStatusBadge(order.status)}>
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600">
                        ₦{order.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-6 h-6 text-gray-600 transition-transform ${
                        expandedId === order.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedId === order.id && (
                  <div className="border-t border-gray-200 p-6 space-y-8 bg-gray-50">
                    {/* Items */}
                    <div>
                      <h4 className="font-bold text-lg mb-4">Items Ordered</h4>
                      <div className="space-y-4">
                        {order.items.map((item, i) => (
                          <div
                            key={i}
                            className="flex gap-4 bg-white p-4 rounded-2xl"
                          >
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold">{item.name}</h5>
                              <p className="text-sm text-gray-600">
                                ₦{item.price.toLocaleString()} × {item.quantity}
                              </p>
                            </div>
                            <div className="text-right font-bold">
                              ₦{(item.price * item.quantity).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-lg mb-3">
                          Shipping Address
                        </h4>
                        <p className="text-gray-700">
                          {order.customerName}
                          <br />
                          {order.address}
                          <br />
                          {order.phone}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-3">
                          Payment Proof
                        </h4>
                        {order.paymentProof ? (
                          <a
                            href={order.paymentProof}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-600 hover:underline font-medium"
                          >
                            View Screenshot
                          </a>
                        ) : (
                          <p className="text-gray-500 italic">Not uploaded</p>
                        )}
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="bg-white p-6 rounded-2xl">
                      <h4 className="font-bold text-lg mb-4">Order Status</h4>
                      <div className="flex items-center gap-4">
                        {order.status === "pending" && (
                          <>
                            <Clock className="w-8 h-8 text-yellow-600" />
                            <p className="text-lg">Awaiting confirmation</p>
                          </>
                        )}
                        {order.status === "fulfilled" && (
                          <>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                            <p className="text-lg text-green-700">
                              Order fulfilled
                            </p>
                          </>
                        )}
                        {order.status === "rejected" && (
                          <>
                            <XCircle className="w-8 h-8 text-red-600" />
                            <p className="text-lg text-red-700">
                              Order rejected
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-12">
          <Link
            href="/cart"
            className="inline-flex items-center gap-3 text-orange-600 hover:text-orange-700 font-semibold text-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
