"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ChevronDown, Trash2 } from "lucide-react";

export default function MessagesList() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const q = query(
          collection(db, "contactMessages"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messagesData);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this message? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "contactMessages", id));
      setMessages(messages.filter((msg) => msg.id !== id));
      alert("Message deleted successfully");
      setExpandedId(null);
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete message");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Date unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-600">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="px-4 w-full mx-auto">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        Contact Messages
      </h1>

      {messages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className="border border-gray-200 rounded-lg shadow-sm overflow-hidden"
            >
              {/* Collapsible Header */}
              <button
                onClick={() => toggleExpand(message.id)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-800">
                    {message.name}
                  </h3>
                  <p className="text-sm text-gray-600">{message.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(message.createdAt)}
                  </p>
                </div>
                <ChevronDown
                  size={24}
                  className={`text-gray-600 transition-transform flex-shrink-0 ${
                    expandedId === message.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Expanded Content */}
              {expandedId === message.id && (
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">Name</h4>
                      <p className="text-gray-600">{message.name}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">
                        Email
                      </h4>
                      <p className="text-gray-600">
                        <a
                          href={`mailto:${message.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {message.email}
                        </a>
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">
                        Message
                      </h4>
                      <p className="text-gray-600 whitespace-pre-wrap break-words">
                        {message.message}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">
                        Received
                      </h4>
                      <p className="text-gray-600">
                        {formatDate(message.createdAt)}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-gray-200 flex gap-2">
                      <button
                        onClick={() => handleDelete(message.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-semibold"
                      >
                        <Trash2 size={18} />
                        Delete
                      </button>
                    </div>
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
