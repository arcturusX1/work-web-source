
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";

interface HeaderProps {
  user: User | null;
  onSignOut: () => void;
}

export function Header({ user, onSignOut }: HeaderProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 
              className="text-2xl font-bold text-blue-600 cursor-pointer"
              onClick={() => navigate("/")}
            >
              FreelanceHub
            </h1>
          </div>

          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => navigate("/browse")}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Browse Services
            </button>
            <button
              onClick={() => navigate("/how-it-works")}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              How It Works
            </button>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboard
                </Button>
                <Button onClick={onSignOut}>Sign Out</Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate("/auth")}
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate("/auth?tab=creator")}
                >
                  Become a Creator
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button
                onClick={() => navigate("/browse")}
                className="block px-3 py-2 text-gray-700 hover:text-blue-600"
              >
                Browse Services
              </button>
              {user ? (
                <>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={onSignOut}
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/auth")}
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate("/auth?tab=creator")}
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                  >
                    Become a Creator
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
