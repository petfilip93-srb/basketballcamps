import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { CampsPage } from './pages/CampsPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { MyReviewsPage } from './pages/MyReviewsPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { SubmitCampPage } from './pages/SubmitCampPage';
import { CampOwnerDashboardPage } from './pages/CampOwnerDashboardPage';
import { EditCampPage } from './pages/EditCampPage';
import { BasketballLoadingScreen } from './components/BasketballLoadingScreen';
import { CampWithCountry } from './types';
import { Menu, LogOut, Home, LayoutDashboard, Settings, Star, UserCircle, Calendar } from 'lucide-react';
import logoImage from './assets/IMG_20250506_134050_289.webp';
import { Session } from '@supabase/supabase-js';

function AppContent() {
  const { session, loading, userProfile, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<'landing' | 'home' | 'auth' | 'camps' | 'dashboard' | 'admin' | 'reviews' | 'bookings' | 'submit' | 'camp-owner' | 'edit-camp' | 'add-camp'>('landing');
  const [previousSession, setPreviousSession] = useState<Session | null>(session);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [browsingAsGuest, setBrowsingAsGuest] = useState(false);
  const [showBasketballLoading, setShowBasketballLoading] = useState(false);
  const [hasShownInitialAuth, setHasShownInitialAuth] = useState(false);

  useEffect(() => {
    if (session && currentPage === 'landing') {
      if (userProfile?.user_type === 'camp_owner') {
        setCurrentPage('home');
      } else {
        setCurrentPage('camps');
      }
    }

    if (previousSession && !session) {
      setBrowsingAsGuest(true);
      setCurrentPage('camps');
    }

    setPreviousSession(session);
  }, [session, currentPage, userProfile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (showBasketballLoading) {
    return (
      <BasketballLoadingScreen
        onComplete={() => {
          setShowBasketballLoading(false);
          setHasShownInitialAuth(true);
          setBrowsingAsGuest(true);
          setCurrentPage('landing');
        }}
      />
    );
  }

  if (currentPage === 'submit') {
    return <SubmitCampPage onNavigateToAuth={() => setCurrentPage('auth')} onBack={() => {
      setHasShownInitialAuth(true);
      setBrowsingAsGuest(true);
      setCurrentPage('camps');
    }} isFirstCamp={true} />;
  }

  if (currentPage === 'add-camp') {
    return <SubmitCampPage onNavigateToAuth={() => setCurrentPage('auth')} onBack={() => setCurrentPage('camp-owner')} isFirstCamp={false} />;
  }

  if (currentPage === 'camp-owner') {
    return <CampOwnerDashboardPage onBack={() => setCurrentPage('camps')} onAddCamp={() => setCurrentPage('add-camp')} onSubmitFirstCamp={() => setCurrentPage('submit')} />;
  }

  if (currentPage === 'edit-camp') {
    return <EditCampPage onBack={() => setCurrentPage('camp-owner')} />;
  }

  if (currentPage === 'landing') {
    return (
      <LandingPage
        onBrowseAsGuest={() => {
          setBrowsingAsGuest(true);
          setCurrentPage('camps');
        }}
        onSignIn={() => setCurrentPage('auth')}
        onSubmitCamp={() => setCurrentPage('auth')}
      />
    );
  }

  if (!session && !browsingAsGuest) {
    if (!hasShownInitialAuth && currentPage === 'auth') {
      return (
        <AuthPage
          onAuthSuccess={() => {
            setHasShownInitialAuth(true);
            if (userProfile?.user_type === 'camp_owner') {
              setCurrentPage('home');
            } else {
              setCurrentPage('camps');
            }
          }}
          onBack={() => {
            setHasShownInitialAuth(true);
            setShowBasketballLoading(true);
          }}
          showGuestOption={true}
        />
      );
    }

    if (currentPage === 'auth' && hasShownInitialAuth) {
      return (
        <AuthPage
          onAuthSuccess={() => {
            if (userProfile?.user_type === 'camp_owner') {
              setCurrentPage('home');
            } else {
              setCurrentPage('camps');
            }
          }}
          onBack={() => {
            setBrowsingAsGuest(true);
            setCurrentPage('camps');
          }}
          showGuestOption={false}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-basketball-cream via-white to-basketball-sand">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div
              onClick={() => setCurrentPage(session ? 'home' : 'landing')}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img src={logoImage} alt="Basketball Camps Logo" className="h-12 w-auto object-contain" />
            </div>
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(session ? 'home' : 'landing')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium ${
                  currentPage === 'home' || currentPage === 'landing'
                    ? 'bg-basketball-orange text-white'
                    : 'text-basketball-charcoal hover:text-basketball-deep-orange'
                }`}
              >
                <Home className="w-4 h-4" />
                Home
              </button>

              {session && userProfile?.user_type === 'camp_owner' && (
                <button
                  onClick={() => setCurrentPage('camp-owner')}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium ${
                    currentPage === 'camp-owner'
                      ? 'bg-basketball-orange text-white'
                      : 'text-basketball-charcoal hover:text-basketball-deep-orange'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  My Camps
                </button>
              )}

              {session && userProfile?.user_type !== 'camp_owner' && userProfile?.user_type !== 'admin' && (
                <button
                  onClick={() => setCurrentPage('bookings')}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium ${
                    currentPage === 'bookings'
                      ? 'bg-basketball-orange text-white'
                      : 'text-basketball-charcoal hover:text-basketball-deep-orange'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  My Bookings
                </button>
              )}

              {session && (
                <button
                  onClick={() => setCurrentPage('reviews')}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium ${
                    currentPage === 'reviews'
                      ? 'bg-basketball-orange text-white'
                      : 'text-basketball-charcoal hover:text-basketball-deep-orange'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  My Reviews
                </button>
              )}

              {userProfile?.user_type === 'admin' && (
                <button
                  onClick={() => setCurrentPage('admin')}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium ${
                    currentPage === 'admin'
                      ? 'bg-basketball-deep-orange text-white'
                      : 'text-basketball-charcoal hover:text-basketball-deep-orange'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </button>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <>
                <span className="text-sm font-semibold text-basketball-charcoal">Welcome, {userProfile?.full_name}</span>
                <button
                  onClick={async () => {
                    await signOut();
                    setBrowsingAsGuest(true);
                    setCurrentPage('camps');
                  }}
                  className="px-4 py-2 bg-basketball-sand text-basketball-charcoal rounded-lg hover:bg-basketball-dark-sand transition-colors flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setCurrentPage('auth');
                  setBrowsingAsGuest(false);
                }}
                className="px-4 py-2 bg-basketball-orange text-white rounded-lg hover:bg-basketball-deep-orange transition-colors font-semibold shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>

          <button
            className="md:hidden text-slate-600 hover:text-slate-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 p-4 space-y-2">
            <button
              onClick={() => {
                setCurrentPage(session ? 'home' : 'landing');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              Home
            </button>
            {session && userProfile?.user_type === 'camp_owner' && (
              <button
                onClick={() => {
                  setCurrentPage('camp-owner');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                My Camps
              </button>
            )}
            {session && userProfile?.user_type !== 'camp_owner' && userProfile?.user_type !== 'admin' && (
              <button
                onClick={() => {
                  setCurrentPage('bookings');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                My Bookings
              </button>
            )}
            {session && (
              <button
                onClick={() => {
                  setCurrentPage('reviews');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                My Reviews
              </button>
            )}
            {userProfile?.user_type === 'admin' && (
              <button
                onClick={() => {
                  setCurrentPage('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                Admin
              </button>
            )}
            {session && (
              <button
                onClick={async () => {
                  await signOut();
                  setBrowsingAsGuest(true);
                  setCurrentPage('camps');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                Sign Out
              </button>
            )}
          </div>
        )}
      </nav>

      <main>
        {currentPage === 'home' && session && (
          <HomePage
            onFindCamps={() => setCurrentPage('camps')}
            userName={userProfile?.full_name}
          />
        )}
        {currentPage === 'camps' && (
          <CampsPage
            onCampSelect={() => {}}
            onSignInRequired={() => setCurrentPage('auth')}
          />
        )}
        {currentPage === 'bookings' && <MyBookingsPage />}
        {currentPage === 'reviews' && <MyReviewsPage />}
        {currentPage === 'admin' && userProfile?.user_type === 'admin' && (
          <AdminPage
            onSignOut={async () => {
              await signOut();
              setBrowsingAsGuest(true);
              setCurrentPage('camps');
            }}
          />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
