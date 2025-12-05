import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import Button from "@/components/common/buttons";
import ProductCard from "@/components/common/productcard";
import AboutUs from "@/components/about-us";
import CustomerReviews from "@/components/customer-reviews";
import ContactUs from "@/components/contact-us";
import { MessageCircleIcon } from "lucide-react";

export const metadata = {
  title: "Bemigo Enterprises | Your One-stop shop for essentials",
  description:
    "Bemigo Enterprises: Your One-stop shop for quality and affordable essentials. Shop Now!",
};

export default async function Home() {
  // Fetch all products
  const snapshot = await getDocs(
    query(collection(db, "products"), orderBy("createdAt", "desc"))
  );

  const products = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Convert Firestore Timestamp to safe string
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      // Also handle any nested timestamps if you have them
    };
  });

  // Group by category
  const grouped = products.reduce((acc, product) => {
    const cat = product.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});

  const categories = Object.keys(grouped);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url('/bemigo.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Hero Section */}
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

      {/* Categories Sections */}
      {categories.length === 0 ? (
        <section className="py-16 px-6 bg-white text-center">
          <p className="text-gray-600">No products available yet.</p>
        </section>
      ) : (
        categories.map((category, idx) => {
          const items = grouped[category];
          const bgClass = idx % 2 === 0 ? "bg-white" : "bg-gray-50";

          return (
            <section key={category} className={`py-16 px-6 ${bgClass}`}>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
                {category}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {items.slice(0, 3).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {items.length > 3 && (
                <div className="text-center mt-12">
                  <Button
                    href="/products"
                    className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-lg font-medium"
                  >
                    See All {category} →
                  </Button>
                </div>
              )}
            </section>
          );
        })
      )}

      {/* Bulk Orders Available. Contact us for more details! */}
      <section className="py-20 px-6 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
            Are you a Bulk Buyer?
          </h2>
          <p className="text-lg md:text-xl mb-10 opacity-95">
            Get special wholesale prices and dedicated support for bulk orders.
          </p>
          <a
            href="https://wa.me/2349126939069?text=Hello%20Bemigo%20Team!%20I%27m%20interested%20in%20bulk%20purchase.%20Can%20we%20discuss%20wholesale%20pricing%20and%20availability%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-orange-700 font-bold px-10 py-5 rounded-full text-lg hover:bg-gray-100 transition shadow-lg"
          >
            <MessageCircleIcon />
            Contact Sales on WhatsApp
          </a>
        </div>
      </section>
      <CustomerReviews />
      <ContactUs />
    </div>
  );
}
