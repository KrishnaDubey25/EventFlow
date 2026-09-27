import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { EventFlowLogo } from "./EventFlowLogo";
import { ArrowRight, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface NavbarProps {
  onNavigateSection?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateSection }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, getRoleDefaultPath } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const elem = document.getElementById(id);
        if (elem) {
          elem.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      return;
    }

    if (onNavigateSection) {
      onNavigateSection(id);
      return;
    }
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleRoleDestination = () => {
    if (user) {
      navigate(getRoleDefaultPath(user.role));
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 bg-[#EDE3CB]/97 backdrop-blur-xl border-b ${
        scrolled
          ? "border-[#C9A15C]/45 shadow-[0_14px_50px_-28px_rgba(11,17,32,0.25)]"
          : "border-[#C9A15C]/25"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        {/* Brand Logo & Wordmark */}
        <Link
          to="/"
          onClick={() => {
            if (location.pathname === "/") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <EventFlowLogo size={36} variant="light" className="transition-transform group-hover:scale-105 duration-200" />
          <span className="text-xl font-bold tracking-tight text-[#0B1120] font-heading">
            EventFlow
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-9 text-sm font-medium text-[#4A4236]">
          <button
            onClick={() => scrollTo("events-strip")}
            className="hover:text-[#8A6A32] transition-colors cursor-pointer"
          >
            Events
          </button>
          <button
            onClick={() => scrollTo("moving-parts")}
            className="hover:text-[#8A6A32] transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollTo("journey-section")}
            className="hover:text-[#8A6A32] transition-colors cursor-pointer"
          >
            Platform
          </button>
        </nav>

        {/* Right Action Controls */}
        <div className="hidden md:flex items-center gap-3.5">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleRoleDestination}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/70 border border-[#C9A15C]/30 hover:border-[#C9A15C]/60 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
                title="Go to role dashboard"
              >
                <div
                  className="w-6 h-6 rounded-lg text-white font-bold text-xs flex items-center justify-center"
                  style={{ backgroundColor: user.avatarColor || "#C9A15C" }}
                >
                  {user.initials}
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-[#0B1120] group-hover:text-[#8A6A32] transition-colors">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-[#4A4236] capitalize leading-none">
                    {user.role}
                  </div>
                </div>
                <LayoutDashboard className="w-3.5 h-3.5 text-[#4A4236] group-hover:text-[#8A6A32] ml-1 transition-colors" />
              </button>

              <button
                onClick={() => logout()}
                className="p-2 rounded-xl text-[#4A4236] hover:text-rose-600 hover:bg-rose-500/10 border border-transparent hover:border-rose-400/30 transition-colors cursor-pointer"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate("/signin")}
                className="text-sm font-semibold text-[#4A4236] hover:text-[#0B1120] px-3.5 py-2 transition-colors cursor-pointer"
              >
                Sign In
              </button>

              <button
                onClick={() => navigate("/signup")}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#0B1120] bg-gradient-to-r from-[#D9B876] to-[#C9A15C] hover:from-[#E3C081] hover:to-[#D9B876] transition-all shadow-[0_10px_28px_-14px_rgba(201,161,92,0.7)] hover:shadow-[0_12px_32px_-12px_rgba(201,161,92,0.9)] cursor-pointer flex items-center gap-2 group active:scale-[0.98]"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#0B1120] hover:text-[#8A6A32] hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 pt-3 pb-6 bg-[#EDE3CB] border-b border-[#C9A15C]/30 space-y-3 animate-in fade-in duration-150 shadow-lg">
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => scrollTo("events-strip")}
              className="text-left px-2 py-2 text-sm font-medium text-[#4A4236] hover:text-[#8A6A32]"
            >
              Events
            </button>
            <button
              onClick={() => scrollTo("moving-parts")}
              className="text-left px-2 py-2 text-sm font-medium text-[#4A4236] hover:text-[#8A6A32]"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo("journey-section")}
              className="text-left px-2 py-2 text-sm font-medium text-[#4A4236] hover:text-[#8A6A32]"
            >
              Platform
            </button>
          </div>

          <div className="pt-3 border-t border-[#C9A15C]/25 flex flex-col gap-2.5">
            {isAuthenticated && user ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleRoleDestination();
                  }}
                  className="w-full py-2.5 text-center text-sm font-semibold text-[#0B1120] bg-gradient-to-r from-[#D9B876] to-[#C9A15C] rounded-lg shadow-xs flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to {user.role === "attendee" ? "Events" : user.role === "organizer" ? "Operations" : "Operators"}</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2.5 text-center text-sm font-medium text-rose-600 bg-rose-500/10 hover:bg-rose-500/15 rounded-lg flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out ({user.name})</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/signin");
                  }}
                  className="w-full py-2.5 text-center text-sm font-medium text-[#0B1120] bg-white hover:bg-[#F5EFE2] rounded-lg cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/signup");
                  }}
                  className="w-full py-2.5 text-center text-sm font-semibold text-[#0B1120] bg-gradient-to-r from-[#D9B876] to-[#C9A15C] rounded-lg shadow-xs cursor-pointer"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
