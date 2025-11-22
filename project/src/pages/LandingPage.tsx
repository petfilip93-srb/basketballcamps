import React from 'react';
import { Building2, FileText, Instagram } from 'lucide-react';
import logoImage from '../assets/IMG_20250506_134050_289.webp';

interface LandingPageProps {
  onBrowseAsGuest: () => void;
  onSignIn: () => void;
}

export function LandingPage({ onBrowseAsGuest, onSignIn }: LandingPageProps) {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950">
        <div className="flex-grow flex items-center justify-center px-4 py-12">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            <div className="w-96 h-96 bg-white rounded-full flex items-center justify-center p-10 shadow-2xl mb-16">
              <img src={logoImage} alt="Basketball Camps Logo" className="w-full h-full object-contain rounded-full" />
            </div>

            <div className="flex flex-col gap-6 w-full max-w-md">
              <button
                onClick={onSignIn}
                className="w-full px-12 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-2xl"
              >
                Sign In / Sign Up
              </button>

              <button
                onClick={onBrowseAsGuest}
                className="w-full px-12 py-4 bg-transparent border-4 border-white text-white rounded-lg font-bold text-xl hover:bg-white/10 transition-all transform hover:scale-105 shadow-2xl"
              >
                Explore Without Sign In
              </button>
            </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 max-w-3xl mx-auto mt-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">How It Works</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2 text-lg">Browse Camps</h3>
                  <p className="text-white/90">
                    Explore basketball camps across Europe, filter by country, view details
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2 text-lg">Book Your Spot</h3>
                  <p className="text-white/90">
                    Submit your booking request directly to the camp organizers
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2 text-lg">Attend & Improve</h3>
                  <p className="text-white/90">
                    Train with professional coaches and elevate your basketball skills
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2 text-lg">Leave a Review</h3>
                  <p className="text-white/90">
                    Share your experience and help others find the perfect camp
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="w-full bg-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-slate-900 font-semibold mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Company Details
              </h3>
              <p className="text-slate-600 text-sm mb-2">Basketball Camps Platform</p>
              <a href="mailto:basketballcamps2025@gmail.com" className="text-slate-600 hover:text-slate-900 text-sm block">
                basketballcamps2025@gmail.com
              </a>
            </div>

            <div>
              <h3 className="text-slate-900 font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                For Camp Owners
              </h3>
              <p className="text-slate-600 text-sm">
                Sign up as a Camp Owner to submit and manage your camps
              </p>
            </div>

            <div>
              <h3 className="text-slate-900 font-semibold mb-3">
                Follow Us
              </h3>
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
    </div>
  );
}
