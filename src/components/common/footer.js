"use client";
import { InstagramIcon, MapPinIcon } from "lucide-react";

export default function Footer() {
  // Get the current year dynamically
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-blue-950 text-white py-6">
      <div className="max-w-7xl mx-auto text-center">
        {/* Brand Name */}
        <h2 className="text-2xl font-bold mb-2">Bemigo Enterprises</h2>

        {/* Address */}
        <p className="text-gray-300 mb-2 flex items-center justify-center gap-2">
          <MapPinIcon className="w-5 h-5" />
          Ugbomro, Effurun, Delta State
        </p>

        {/* Phone Number */}
        <p className="text-gray-300 mb-4">
          <a
            href="tel:+2349126939069"
            className="hover:text-gray-100 transition-colors"
          >
            +234-9126939069
          </a>
        </p>

        {/* Social Links */}
        <div className="flex justify-center gap-4">
          <a
            href="hhttps://www.instagram.com/jen_nystores?igsh=Z2dxZm00OHQ0cmdq"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 hover:text-blue-800 transition-colors bg-white p-4 rounded-full"
            aria-label="Instagram"
          >
            <InstagramIcon className="w-6 h-6" />
          </a>
          <a
            href="https://www.google.com/business"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 hover:text-blue-800 transition-colors bg-white p-4 rounded-full"
            aria-label="Google My Business"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Copyright / Rights Reserved with Automatic Year Update */}
      <p className="text-center text-gray-500 text-sm mt-8">
        &copy; {currentYear} Bemigo Enterprises. All Rights Reserved.
      </p>

      {/* Powered by... */}
      <p className="text-center text-gray-600 text-xs mt-2">
        Powered by HIGH-ER ENTERPRISES
      </p>
    </footer>
  );
}
