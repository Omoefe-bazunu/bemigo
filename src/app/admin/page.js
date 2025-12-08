"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
// Renaming the import to the correct component name from the previous request
import AddProductForm from "@/components/admin/addproduct"; // Use the generic AddProductForm
// Removed: AddFashionProduct, AddCateringProduct
import ProductList from "@/components/admin/productlist";
import MessagesList from "@/components/admin/messagelist";
import OrdersList from "@/components/admin/orderslist";
import UsersList from "@/components/admin/userslist";

export default function AdminPage() {
  const router = useRouter();
  const [expandedForm, setExpandedForm] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false); // NEW: Login specific loading state
  const [loginError, setLoginError] = useState("");
  const [userCount, setUserCount] = useState(0);

  // Create a wrapper component that sets the count
  const UsersListWithCount = () => {
    return <UsersList onCountChange={setUserCount} />;
  };
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Check authentication on mount - always show login modal on page load
  useEffect(() => {
    // Always start as unauthenticated on component mount
    setIsAuthenticated(false);
    setAuthLoading(false);
  }, []);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLoginError("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!formData.email || !formData.password) {
      setLoginError("Email and password are required");
      return;
    }

    setLoginLoading(true); // START LOGIN LOADING

    try {
      // Fetch admin credentials from Firestore: Collection "admin", Document "adminAccess"
      const adminDocRef = doc(db, "admin", "adminAccess");
      const adminDocSnap = await getDoc(adminDocRef);

      if (!adminDocSnap.exists()) {
        setLoginError("Admin configuration not found.");
        return;
      }

      const adminData = adminDocSnap.data();

      // Verify credentials against Firestore data
      if (
        formData.email === adminData.email &&
        formData.password === adminData.password
      ) {
        setIsAuthenticated(true);
        // Using sessionStorage is fine for a basic admin auth
        sessionStorage.setItem("adminAuthenticated", "true");
        setFormData({ email: "", password: "" });
      } else {
        setLoginError("Invalid email or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(
        "An error occurred during login. Check console for details."
      );
    } finally {
      setLoginLoading(false); // END LOGIN LOADING
    }
  };

  const toggleForm = (form) => {
    setExpandedForm(expandedForm === form ? null : form);
  };

  // Loading state (Initial Auth Check)
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Loading Admin Panel...</p>
      </div>
    );
  }

  // Not authenticated - show modal with blurred content
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 relative">
        {/* Blurred Background Content (unchanged) */}
        <div className="blur-sm pointer-events-none py-12 px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-12 text-center">
            Admin Dashboard
          </h1>
          <div className="max-w-5xl mx-auto space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-lg shadow-md h-16 bg-gray-100"
              />
            ))}
          </div>
        </div>

        {/* Login Modal */}
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Admin Access
            </h2>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Admin Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleLoginChange}
                  placeholder="Enter admin email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  disabled={loginLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleLoginChange}
                  placeholder="Enter password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  disabled={loginLoading}
                />
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm font-medium">
                    {loginError}
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Logging In...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <p className="text-center text-gray-600 text-sm mt-4">
              Admin panel - authorized personnel only
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated - show dashboard
  return (
    <div className="py-12 px-4">
      <div className="flex justify-between items-center mb-12 mt-20">
        <h1 className="text-4xl font-bold text-gray-800 text-center mx-auto">
          Admin Dashboard
        </h1>
      </div>

      {/* Collapsible Sections */}
      <div className="max-w-5xl mx-auto space-y-4">
        {/* 📦 Add NEW Product Form (Generic) */}
        <div className="border border-gray-200 rounded-lg shadow-md">
          <button
            onClick={() => toggleForm("addProduct")}
            className="w-full cursor-pointer px-6 py-3 bg-gray-100 text-gray-800 font-semibold text-left flex justify-between items-center rounded-t-lg hover:bg-gray-200 transition-colors"
          >
            <span>Add New Product (All Categories)</span>
            <span>{expandedForm === "addProduct" ? "−" : "+"}</span>
          </button>
          {expandedForm === "addProduct" && (
            <div className="p-6">
              {/* Use the generic AddProductForm */}
              <AddProductForm />
            </div>
          )}
        </div>

        {/* Product List Section */}
        <div className="border border-gray-200 rounded-lg shadow-md">
          <button
            onClick={() => toggleForm("productList")}
            className="w-full cursor-pointer px-6 py-3 bg-gray-100 text-gray-800 font-semibold text-left flex justify-between items-center rounded-t-lg hover:bg-gray-200 transition-colors"
          >
            <span>Product List</span>
            <span>{expandedForm === "productList" ? "−" : "+"}</span>
          </button>
          {expandedForm === "productList" && (
            <div className="p-6">
              <ProductList />
            </div>
          )}
        </div>

        {/* Message List Section */}
        <div className="border border-gray-200 rounded-lg shadow-md">
          <button
            onClick={() => toggleForm("messageList")}
            className="w-full cursor-pointer px-6 py-3 bg-gray-100 text-gray-800 font-semibold text-left flex justify-between items-center rounded-t-lg hover:bg-gray-200 transition-colors"
          >
            <span>Message List</span>
            <span>{expandedForm === "messageList" ? "−" : "+"}</span>
          </button>
          {expandedForm === "messageList" && (
            <div className="p-6">
              <MessagesList />
            </div>
          )}
        </div>

        {/* Orders List Section */}
        <div className="border border-gray-200 rounded-lg shadow-md">
          <button
            onClick={() => toggleForm("ordersList")}
            className="w-full cursor-pointer px-6 py-3 bg-gray-100 text-gray-800 font-semibold text-left flex justify-between items-center rounded-t-lg hover:bg-gray-200 transition-colors"
          >
            <span>Orders List</span>
            <span>{expandedForm === "ordersList" ? "−" : "+"}</span>
          </button>
          {expandedForm === "ordersList" && (
            <div className="p-6">
              <OrdersList />
            </div>
          )}
        </div>
        {/* Users List Section */}

        <div className="border border-gray-200 rounded-lg shadow-md">
          <button
            onClick={() => toggleForm("usersList")}
            className="w-full cursor-pointer px-6 py-3 bg-gray-100 text-gray-800 font-semibold text-left flex justify-between items-center rounded-t-lg hover:bg-gray-200 transition-colors"
          >
            <span>Users List ({userCount})</span>
            <span>{expandedForm === "usersList" ? "−" : "+"}</span>
          </button>
          {expandedForm === "usersList" && (
            <div className="p-6">
              <UsersListWithCount />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
