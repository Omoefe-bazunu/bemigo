"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
// Re-import the icon needed for the mobile menu button
import { MenuIcon } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu toggle

  // Fetch user cart from Firestore
  useEffect(() => {
    if (!user) {
      setCart([]);
      return;
    }

    const cartRef = collection(db, "users", user.uid, "cart");
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      const cartItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCart(cartItems);
    });

    return () => unsubscribe();
  }, [user]);

  // Determine if the user is logged in
  const isLoggedIn = !!user;

  // Calculate cart item count safely
  const cartItemCount = (cart || []).reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  // Base navigation items
  const primaryNavItems = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Orders", href: "/orders" },
  ];

  // Conditional Utility Items
  const utilityNavItems = [
    { name: "Account", href: isLoggedIn ? "/account" : "/login" },
    {
      name: "Cart",
      href: "/cart",
      badge: isLoggedIn ? cartItemCount : 0,
    },
    // The Login/Register link is handled by the Account link if logged out, or can be added separately
  ];

  // Logic to handle Login/Register in Utility Links
  if (!isLoggedIn) {
    utilityNavItems[0].name = "Login / Register";
  }

  // Helper function to render the text-based navigation item link structure
  const renderNavItem = (item) => {
    const isActive = pathname === item.href;
    const baseClasses =
      "relative px-3 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap";
    const activeClasses =
      "text-orange-600 dark:text-orange-500 border-b-2 border-orange-600 dark:border-orange-500";
    const inactiveClasses =
      "text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 hover:border-b-2 hover:border-orange-600/50 dark:hover:border-orange-500/50";

    return (
      <Link
        key={item.name}
        href={item.href}
        className={`${baseClasses} ${
          isActive ? activeClasses : inactiveClasses
        }`}
        onClick={() => setIsMenuOpen(false)} // Close menu on link click
      >
        {item.name}
        {/* Show badge ONLY if it's the Cart item and count > 0 */}
        {item.name === "Cart" && item.badge > 0 && (
          <span className="absolute -top-0.5 right-1 w-5 h-5 ml-1 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md w-full border-b dark:border-blue-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 💻 Desktop Header - Modern e-commerce layout */}
        <div className="hidden lg:flex items-center justify-between h-16">
          {/* Logo/Brand Name */}
          <Link
            href="/"
            className="text-xl font-extrabold text-blue-800 dark:text-white tracking-wider uppercase"
          >
            Bemigo Enterprises
          </Link>

          {/* Primary Navigation Links (Center) */}
          <nav className="flex items-center space-x-1">
            {primaryNavItems.map((item) => renderNavItem(item))}
          </nav>

          {/* Utility Links (Right) */}
          <div className="flex items-center space-x-1">
            {utilityNavItems.map((item) => renderNavItem(item))}
          </div>
        </div>

        {/* 📱 Mobile Header */}
        <div className="flex lg:hidden items-center justify-between h-14">
          <Link href="/" className="text-xl font-extrabold text-blue-800">
            BEMIGO
          </Link>

          <div className="flex items-center space-x-3">
            {/* Mobile Utility Links (Text-based Cart/Account) */}
            {utilityNavItems.map((item) => renderNavItem(item))}

            {/* Mobile Menu Button (Hamburger Icon Exception) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* ⚠️ Mobile Menu Panel (Hidden/Shown based on isMenuOpen state) */}
      <div
        className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? "max-h-96 opacity-100 py-2" : "max-h-0 opacity-0"
        }`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-start">
          {/* Combine all links for the mobile menu list */}
          {[...primaryNavItems].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left"
              onClick={() => setIsMenuOpen(false)} // Close menu on click
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
