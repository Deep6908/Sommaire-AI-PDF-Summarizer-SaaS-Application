import { FaGithub, FaInstagram } from "react-icons/fa";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gradient-to-tr from-rose-100 via-rose-50 to-white border-t border-rose-200 px-6 py-12 md:py-16 mt-12 shadow-inner">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        {/* Branding */}
        <div className="flex flex-col items-center md:items-start gap-2 md:w-1/3">
          <span className="text-2xl font-bold text-gray-800 tracking-tight">Sommaire</span>
          <span className="text-sm text-gray-500">AI-Powered PDF Summarization</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center md:justify-center gap-6 text-gray-600 font-medium text-sm md:w-1/3">
          <Link href="/" className="hover:text-blue-600 transition">Home</Link>
          <Link href="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link>
          <Link href="/upload" className="hover:text-blue-600 transition">Upload</Link>
          <Link href="/#pricing" className="hover:text-blue-600 transition">Pricing</Link>
        </nav>

        {/* Social Icons */}
        <div className="flex justify-center md:justify-end gap-4 md:w-1/3">
          <a href="https://github.com/Deep6908" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-800 transition text-xl">
            <FaGithub />
          </a>
          <a href="https://www.instagram.com/_.driptxnshu._/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-500 transition text-xl">
            <FaInstagram />
          </a>
        </div>
      </div>
      <div className="mt-8 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Sommaire. All rights reserved.
      </div>
      <div className="mt-4 flex flex-col items-center justify-center gap-2">
        <span className="text-xs text-gray-400">Developed &amp; Maintained by</span>
        <a
          href="https://www.linkedin.com/in/deeptangshu-p/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 px-3 py-1 rounded-md hover:bg-rose-100 transition"
        >
          <img
            src="/vercel.svg"
            alt="Deeptangshu Paul"
            className="w-12 h-12 rounded-full border border-rose-200 shadow-sm bg-white object-cover"
          />
          <span className="font-semibold text-gray-700 hover:text-rose-600 transition text-center">Deeptangshu Paul</span>
        </a>
      </div>
    </footer>
  );
}