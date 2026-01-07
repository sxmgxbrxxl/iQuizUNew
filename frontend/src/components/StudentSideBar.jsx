import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LOGO from "../assets/iQuizU.svg";
import { Menu, FileText, BarChart3, LogOut, Home, Trophy, Bell, Mail } from "lucide-react";
import { auth } from "../firebase/firebaseConfig";
import { signOut } from "firebase/auth";

export default function StudentSidebar({ user, userDoc }) {
  // Use React state instead of localStorage
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Update CSS variable when collapsed state changes
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isCollapsed ? "80px" : "288px"
    );
  }, [isCollapsed]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  const menuItems = [
    { to: "/student", icon: Home, label: "Dashboard" },
    { to: "/student/quizzes", icon: FileText, label: "Quizzes" },
    { to: "/student/performance", icon: BarChart3, label: "Performance" },
    { to: "/student/leaderboards", icon: Trophy, label: "Leaderboards" },
  ];

  // Function to check if link is active
  const isActive = (path) => {
    if (path === "/student") {
      return location.pathname === "/student";
    }
    return location.pathname.includes(path);
  };

  // Get user display name
  const userName = userDoc?.firstName || userDoc?.name || "Student";
  const userEmail = userDoc?.email || user?.email || "Learner";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <>
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-green-600 via-green-700 to-green-800 shadow-lg z-50 flex items-center justify-between px-6">
        {/* Left Section: Logo and Hamburger */}
        <div className="flex items-center gap-4">
          {/* Hamburger Menu - Desktop: collapse sidebar, Mobile: open overlay */}
          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsMobileOpen(!isMobileOpen);
              } else {
                setIsCollapsed(!isCollapsed);
              }
            }}
            className="text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200 hover:scale-105"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>

          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="Logo" className="w-8 h-8" />
            <div className="flex flex-col text-white">
              <h1 className="text-lg font-bold font-Outfit leading-tight">iQuizU</h1>
            </div>
          </div>
        </div>

        {/* Right Section: Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* User Profile */}
          <button
            onClick={() => navigate('/student/profile')}
            className="flex items-center gap-2 hover:bg-white/10 p-2 pr-3 rounded-lg transition-all duration-200 hover:scale-105"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-green-300 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white/20">
              {userInitial}
            </div>
            <span className="text-white font-medium text-sm hidden md:block">{userName}</span>
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-16 left-0 h-[calc(100vh-64px)] bg-gradient-to-br from-green-600 via-green-700 to-green-800 shadow-2xl transition-all duration-300 ease-in-out z-40
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed ? "lg:w-20" : "lg:w-72"}
        w-72`}
      >
        {/* Navigation */}
        <nav className={`flex flex-col py-6 space-y-3 overflow-y-auto h-full transition-all duration-300 ${isCollapsed ? "px-2" : "px-6"}`}>
          {/* Menu Items */}
          <div className="flex flex-col space-y-3">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => {
                  setIsMobileOpen(false);
                  if (isActive(item.to)) {
                    window.dispatchEvent(new Event('refreshPage'));
                  }
                }}
                title={isCollapsed ? item.label : ""}
                className={`flex items-center relative overflow-hidden rounded-xl text-white transition-all duration-300 group ${
                  isCollapsed ? "justify-center py-3 hover:bg-white/10" : "gap-4 px-4 py-3 hover:bg-white/10"
                } ${isActive(item.to) ? "bg-white/20 shadow-lg" : ""}`}
              >
                {/* Hover gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>

                {/* Icon */}
                <div className={`relative flex items-center justify-center w-6 h-6 group-hover:scale-110 transition-transform duration-300 ${isActive(item.to) ? "scale-110" : ""}`}>
                  <item.icon size={22} className="text-white" />
                </div>

                {/* Label */}
                <span className={`relative font-Outfit font-medium text-base transition-all duration-300 whitespace-nowrap ${
                  isCollapsed ? "opacity-0 max-w-0 overflow-hidden" : "opacity-100 max-w-xs"
                }`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="pt-4 pb-2">
            <div className="border-t border-white/20 rounded-full"></div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              setIsMobileOpen(false);
              setShowConfirm(true);
            }}
            title={isCollapsed ? "Logout" : ""}
            className={`flex items-center relative overflow-hidden rounded-xl text-white transition-all duration-300 group w-full ${
              isCollapsed ? "justify-center py-3 hover:bg-red-500/30" : "gap-4 px-4 py-3.5 hover:bg-red-500/30"
            }`}
          >
            {/* Hover gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-500/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>

            {/* Icon */}
            <div className="relative flex items-center justify-center w-6 h-6 group-hover:scale-110 transition-transform duration-300">
              <LogOut size={22} className="text-white" />
            </div>

            {/* Label */}
            <span className={`relative font-Outfit font-medium text-base transition-all duration-300 whitespace-nowrap ${
              isCollapsed ? "opacity-0 max-w-0 overflow-hidden" : "opacity-100 max-w-xs"
            }`}>
              Logout
            </span>
          </button>
        </nav>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden transition-opacity top-16"
        />
      )}

      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div className="font-Outfit fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform animate-slideUp">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 p-4 rounded-full items-center justify-center flex">
                <LogOut className="text-red-500" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-title">Confirm Logout</h3>
                <p className="text-subtext">Are you sure you want to log out?</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 active:scale-95 hover:scale-105 duration-200 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 active:scale-95 hover:scale-105 duration-200 transition font-semibold"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}