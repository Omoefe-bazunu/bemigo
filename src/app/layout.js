import "./globals.css";
import Header from "@/components/common/header";
import Footer from "@/components/common/footer";
import { AuthProvider } from "@/context/AuthContext";
// Import WhatsAppIcon for the floating button
import { IoLogoWhatsapp } from "react-icons/io";
import { Bricolage_Grotesque } from "next/font/google";

export const metadata = {
  title: "Bemigo Enterprises | Your One-stop shop for essentials",
  description:
    "Bemigo Enterprises: Your One-stop shop for quality and affordable essentials. Shop Now!",
};

// Load Bricolage Grotesque properly
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

// Define the component for the floating WhatsApp button
const WhatsAppWidget = () => {
  // Use the phone number provided, encoding the URL properly
  const phoneNumber = "2349126939069";
  const defaultMessage =
    "Hello Bemigo Enterprises, I'm interested in your products!";

  // Format the URL for direct WhatsApp chat
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    defaultMessage
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 p-4 bg-green-500 text-white rounded-full shadow-lg 
                 hover:bg-green-600 transition-colors duration-300 transform hover:scale-110"
      aria-label="Chat with us on WhatsApp"
    >
      <IoLogoWhatsapp className="w-8 h-8" />
    </a>
  );
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={bricolage.variable}>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Header />

          <main className="flex-grow">{children}</main>
          <Footer />
          {/* The WhatsApp widget is placed here to appear on all pages */}
          <WhatsAppWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
