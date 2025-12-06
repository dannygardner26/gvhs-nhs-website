"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "./button";
import { Menu, X, GraduationCap } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: "/", href: "/" },
    { name: "/checkin", href: "/checkin" },
    { name: "/volunteering", href: "/volunteering" },
    { name: "/tutor/register", href: "/tutor/register" },
    { name: "/tutor/status", href: "/tutor/status" },
    { name: "/tutor/checkin", href: "/tutor/checkin" },
    { name: "/tutor/profile", href: "/tutor/profile" },
    { name: "/admin", href: "/admin" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-royal-blue rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">GVHS</span>
              <span className="text-lg font-bold text-royal-blue ml-1">NHS</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 relative group ${
                  pathname === item.href
                    ? "text-royal-blue"
                    : "text-gray-700 hover:text-royal-blue"
                }`}
              >
                {item.name}
                <span className={`absolute inset-x-0 bottom-0 h-0.5 bg-royal-blue transition-transform duration-200 ${
                  pathname === item.href
                    ? "transform scale-x-100"
                    : "transform scale-x-0 group-hover:scale-x-100"
                }`} />
              </Link>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white transition-all duration-200 hover-glow"
            >
              Login
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-royal-blue"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                    pathname === item.href
                      ? "text-royal-blue bg-blue-50 border-l-4 border-royal-blue"
                      : "text-gray-700 hover:text-royal-blue hover:bg-blue-50"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white transition-all duration-200"
                >
                  Login
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}