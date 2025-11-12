import Link from "next/link";
import { GraduationCap, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and School Info */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-royal-blue rounded-full flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">GVHS</span>
                <span className="text-lg font-bold text-blue-400 ml-1">NHS</span>
              </div>
            </Link>
            <p className="text-gray-300 mb-4 max-w-md">
              The Great Valley High School National Honor Society recognizes outstanding
              students who demonstrate excellence in scholarship, leadership, service,
              and character.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
              <MapPin className="w-4 h-4" />
              <span>225 North Phoenixville Pike</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Mail className="w-4 h-4" />
              <span>pmorabito@gvsd.org</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/tutoring"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  Tutoring Services
                </Link>
              </li>
              <li>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* NHS Pillars */}
          <div>
            <h3 className="text-lg font-semibold mb-4">NHS Pillars</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">Scholarship</li>
              <li className="text-gray-300">Leadership</li>
              <li className="text-gray-300">Service</li>
              <li className="text-gray-300">Character</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400 mb-4 md:mb-0">
            <p>&copy; 2024 Great Valley High School National Honor Society. All rights reserved.</p>
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <span>Advisor: Dr. Paige Morabito</span>
            <span>•</span>
            <a
              href="mailto:pmorabito@gvsd.org"
              className="hover:text-blue-400 transition-colors duration-200"
            >
              pmorabito@gvsd.org
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}