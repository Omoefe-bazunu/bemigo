// app/about/page.jsx
import AboutUs from "@/components/about-us";
import Image from "next/image";
import { FaTiktok } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { FaFacebookF } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";

export const metadata = {
  title: "About Bemigo Enterprises | Quality & Affordable Essentials",
  description:
    "Learn about Bemigo Enterprises – founded and led by Miss Jennifer Bemigo Ajemigbitse in Delta State, Nigeria.",
};

export default function about() {
  return (
    <>
      {/* Hero About Section */}
      <section className="py-16 px-6 md:px-20 bg-gray-50">
        <AboutUs />
      </section>

      {/* Social Media & Contact Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Connect With Us
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Follow us for the latest products, offers, and behind-the-scenes!
          </p>

          {/* Social Icons */}
          <div className="flex justify-center gap-8 mb-16 flex-wrap">
            <a
              href="https://web.facebook.com/profile.php?id=61583111909212"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl hover:scale-110 transition">
                <FaFacebookF />
              </div>
              <p className="mt-2 text-sm font-medium">Facebook</p>
            </a>

            <a
              href="https://www.instagram.com/jen_nystores?igsh=Z2dxZm00OHQ0cmdq"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-3xl hover:scale-110 transition">
                <FaInstagram />
              </div>
              <p className="mt-2 text-sm font-medium">Instagram</p>
            </a>

            <a
              href="https://www.tiktok.com/@jennymigo?_r=1&_t=ZS-91zgEEvRX4U"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white text-3xl hover:scale-110 transition">
                <FaTiktok />
              </div>
              <p className="mt-2 text-sm font-medium">TikTok</p>
            </a>

            <a
              href="https://wa.me/2349126939069"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl hover:scale-110 transition">
                <FaWhatsapp />
              </div>
              <p className="mt-2 text-sm font-medium">WhatsApp</p>
            </a>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 rounded-2xl p-10 space-y-6 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800">Get in Touch</h3>
            <div className="space-y-4 text-left">
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">Phone:</span>
                <a
                  href="tel:+2349126939069"
                  className="text-lg text-orange-600 font-medium"
                >
                  +234 912 693 9069
                </a>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">WhatsApp:</span>
                <a
                  href="https://wa.me/2349126939069"
                  className="text-lg text-green-600 font-medium"
                >
                  Chat Now
                </a>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">Email:</span>

                <a
                  href="mailto:bemigoenterprises@gmail.com"
                  className="text-lg text-orange-600 font-medium"
                >
                  bemigoenterprises@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
