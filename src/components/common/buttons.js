"use client";
import Link from "next/link";

export default function Button({ href, children, className = "" }) {
  return (
    <Link
      href={href}
      className={`inline-block px-4 py-3 w-fit text-center cursor-pointer text-nowrap rounded-lg font-medium text-white transition-colors ${className}`}
    >
      {children}
    </Link>
  );
}
