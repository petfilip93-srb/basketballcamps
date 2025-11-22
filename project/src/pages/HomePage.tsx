import React from 'react';
import { Building2, Mail, Phone, Instagram } from 'lucide-react';
import logoImage from '../assets/IMG_20250506_134050_289.webp';

interface HomePageProps {
  onFindCamps: () => void;
  userName?: string;
}

export function HomePage({ onFindCamps, userName }: HomePageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-80 h-80 bg-white rounded-full flex items-center justify-center p-8 shadow-2xl mb-12 mx-auto">
            <img src={logoImage} alt="Basketball Camps Logo" className="w-full h-full object-contain rounded-full" />
          </div>

          <button
            onClick={onFindCamps}
            className="w-full max-w-md mx-auto px-12 py-5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-2xl transition-all transform hover:scale-105 shadow-2xl"
          >
            Find Your Next Camp
          </button>
        </div>
      </div>

      <footer className="w-full bg-white py-12 px-4 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-slate-900 font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Company Details
              </h3>
              <p className="text-slate-600 text-sm mb-2 font-medium">Basketball Camps Europe</p>
              <p className="text-slate-600 text-sm mb-2">123 Sports Avenue</p>
              <p className="text-slate-600 text-sm mb-4">Belgrade, Serbia</p>
            </div>

            <div>
              <h3 className="text-slate-900 font-semibold mb-4">Contact Us</h3>
              <a href="mailto:basketballcamps2025@gmail.com" className="text-slate-600 hover:text-slate-900 text-sm flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4" />
                basketballcamps2025@gmail.com
              </a>
              <a href="tel:+381234567890" className="text-slate-600 hover:text-slate-900 text-sm flex items-center gap-2">
                <Phone className="w-4 h-4" />
                +381 23 456 7890
              </a>
            </div>

            <div>
              <h3 className="text-slate-900 font-semibold mb-4">Follow Us</h3>
              <a
                href="https://www.instagram.com/basketballcamps2025"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-slate-900 text-sm flex items-center gap-2"
              >
                <Instagram className="w-5 h-5" />
                @basketballcamps2025
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200 text-center">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Basketball Camps. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
