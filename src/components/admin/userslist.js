// components/admin/userslist.jsx
"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { format } from "date-fns";

export default function UsersList({ onCountChange }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);

        const usersData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const userId = doc.id;

            // Count orders from main /orders collection
            let totalOrders = 0;
            try {
              const ordersSnap = await getDocs(collection(db, "orders"));
              totalOrders = ordersSnap.docs.filter(
                (orderDoc) => orderDoc.data().userId === userId
              ).length;
            } catch (err) {
              console.error("Error counting orders:", err);
            }

            return {
              id: userId,
              name: data.displayName || "N/A",
              email: data.email || "N/A",
              phone: data.phoneNumber || "Not provided",
              totalOrders,
              joinedAt:
                data.createdAt?.toDate?.() ||
                data.createdTime?.toDate?.() ||
                null,
            };
          })
        );

        setUsers(usersData);
        onCountChange?.(usersData.length);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [onCountChange]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <p className="text-gray-600 mt-4">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-600 text-center">
        <p className="font-semibold">Error:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        All Users ({users.length})
      </h3>

      {users.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No users found.</p>
      ) : (
        <div className="space-y-4">
          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white border rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-xl">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Orders</p>
                    <p className="font-bold text-orange-600">
                      {user.totalOrders}
                    </p>
                  </div>
                  {user.joinedAt && (
                    <div className="col-span-2">
                      <p className="text-gray-500">Joined</p>
                      <p className="font-medium">
                        {format(user.joinedAt, "dd MMM yyyy")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <table className="hidden md:table w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="text-left p-4 font-semibold text-gray-700">
                  User
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  Email
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  Phone
                </th>
                <th className="text-center p-4 font-semibold text-gray-700">
                  Orders
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <span className="text-orange-600 font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{user.email}</td>
                  <td className="p-4 text-gray-600">{user.phone}</td>
                  <td className="p-4 text-center font-bold text-orange-600">
                    {user.totalOrders}
                  </td>
                  <td className="p-4 text-gray-600">
                    {user.joinedAt
                      ? format(user.joinedAt, "dd MMM yyyy")
                      : "Unknown"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
