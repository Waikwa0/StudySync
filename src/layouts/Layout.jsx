import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { FiUser, FiChevronDown } from "react-icons/fi";

export default function Layout() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const dropdownRef = useRef();

  // Redirect if no user
  useEffect(() => {
    if (!currentUser) {
      navigate("/login", { replace: true });
    }
  }, [currentUser, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex">
      <Sidebar
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
        handleLogout={handleLogout}
      />

      <div
        className={`flex-1 min-h-screen transition-all duration-300`}
        style={{ marginLeft: isExpanded ? "256px" : "80px" }}
      >
        {/* Top bar */}
        <div className="flex justify-end items-center p-4 bg-gray-100 border-b border-gray-200 relative">
          <div className="flex items-center gap-3 cursor-pointer relative" ref={dropdownRef}>
            <span className="text-gray-800 font-medium">
              {currentUser.displayName || currentUser.email}
            </span>
            <FiUser size={28} className="text-gray-800" />
            <FiChevronDown
              size={20}
              className="text-gray-800"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-10 w-40 bg-white border rounded-lg shadow-lg z-50">
                <button
                  onClick={() => alert("Profile clicked")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
