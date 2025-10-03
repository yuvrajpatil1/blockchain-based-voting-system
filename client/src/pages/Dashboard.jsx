import React, { useState } from "react";
import {
  Home,
  ArrowRightLeft,
  BanknoteArrowDown,
  LogOut,
  X,
  Copy,
  Menu,
  Users,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import BeCandidateModal from "./modals/BeCandidateModal";

export default function Dashboard({ children }) {
  const { user } = useSelector((state) => state.users);
  const [showBeCandidateModal, setShowBeCandidateModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.pathname.split("/")[1] || "dashboard"
  );

  const navigate = useNavigate();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy:", err);
    });
  };

  const userMenu = [
    {
      id: "dashboard",
      icon: Home,
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
      path: "/dashboard",
    },
    {
      id: "transactions",
      icon: ArrowRightLeft,
      label: "Polls",
      onClick: () => navigate("/polling"),
      path: "/polling",
    },
    {
      id: "requests",
      icon: BanknoteArrowDown,
      label: "Results",
      onClick: () => navigate("/results"),
      path: "/results",
    },
    {
      id: "logout",
      icon: LogOut,
      label: "Logout",
      onClick: () => {
        localStorage.removeItem("token");
        navigate("/logout");
      },
      path: "/logout",
    },
  ];

  const adminMenu = [
    {
      id: "dashboard",
      icon: Home,
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
      path: "/dashboard",
    },
    {
      id: "users",
      icon: Users,
      label: "Admin",
      onClick: () => navigate("/admin"),
      path: "/admin",
    },
    {
      id: "transactions",
      icon: ArrowRightLeft,
      label: "Polling",
      onClick: () => navigate("/polling"),
      path: "/polling",
    },
    {
      id: "requests",
      icon: BanknoteArrowDown,
      label: "Results",
      onClick: () => navigate("/results"),
      path: "/results",
    },
    {
      id: "logout",
      icon: LogOut,
      label: "Logout",
      onClick: () => {
        localStorage.removeItem("token");
        navigate("/logout");
      },
      path: "/logout",
    },
  ];

  const menuToRender = user?.role === "admin" ? adminMenu : userMenu;

  return (
    <div className="min-h-dvh w-full bg-gradient-to-tr from-black via-[#1e0b06] to-black text-white flex overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900/50 backdrop-blur-md border-b border-gray-700/60 z-30">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-300 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-100">Electoral</h1>
          </div>

          <div className="w-10" />
        </div>
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        menuItems={menuToRender}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex flex-col min-h-dvh">
        <main className="flex-1 p-4 sm:p-6 pt-20 lg:pt-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8 gap-4">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-100">
                  Hi, {user?.name?.split(' ')[0] || user?.name || 'User'}!
                </h1>

                <button
                  className="w-full sm:w-auto px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-medium transition-colors text-sm lg:text-base shadow-lg"
                  onClick={() => setShowBeCandidateModal(true)}
                >
                  BE A CANDIDATE
                </button>
                <BeCandidateModal
                  showBeCandidateModal={showBeCandidateModal}
                  setShowBeCandidateModal={setShowBeCandidateModal}
                />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row mt-4 gap-6">
              {" "}
              <div className="flex-1">
                <div className="bg-gray-800/40 backdrop-blur-3xl border border-gray-700/60 rounded-2xl overflow-hidden shadow-xl">
                  <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 sm:p-6 text-white">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-lg font-semibold mb-2">
                          User Id
                        </h3>
                        <div className="flex items-center">
                          <span className="font-mono text-sm sm:text-lg tracking-wider mr-2 truncate">
                            {user?._id || "Loading..."}
                          </span>
                          <button
                            onClick={() => copyToClipboard(user?._id)}
                            className="p-1.5 sm:p-2 hover:bg-orange-400 hover:bg-opacity-20 rounded-lg transition-colors flex-shrink-0"
                            title="Copy account number"
                          >
                            <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-lg font-semibold mb-2">
                          Wallet Address
                        </h3>
                        <div className="flex items-center">
                          <span className="font-mono text-sm sm:text-lg tracking-wider mr-2 truncate">
                            {user?.walletAddress || "Loading..."}
                          </span>
                          <button
                            onClick={() => copyToClipboard(user?.walletAddress)}
                            className="p-1.5 sm:p-2 hover:bg-orange-400 hover:bg-opacity-20 rounded-lg transition-colors flex-shrink-0"
                            title="Copy wallet address"
                          >
                            <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex flex-row sm:items-center py-2 sm:py-3">
                          <span className="font-medium text-gray-400 text-sm sm:text-lg mb-1 sm:mb-0">
                            Name:&nbsp;
                          </span>
                          <span className="font-semibold text-gray-50 text-sm sm:text-lg sm:ml-2">
                            {user?.name || "N/A"}
                          </span>
                        </div>

                        <div className="flex flex-row sm:items-center py-2 sm:py-3">
                          <span className="font-medium text-gray-400 text-sm sm:text-lg mb-1 sm:mb-0">
                            Email:&nbsp;
                          </span>
                          <span className="font-semibold text-gray-50 text-sm sm:text-lg sm:ml-2 break-all">
                            {user?.email || "N/A"}
                          </span>
                        </div>

                        <div className="flex flex-row sm:items-center py-2 sm:py-3">
                          <span className="font-medium text-gray-400 text-sm sm:text-lg mb-1 sm:mb-0">
                            Role:&nbsp;
                          </span>
                          <span className="font-semibold text-gray-50 text-sm sm:text-lg sm:ml-2 capitalize">
                            {user?.role || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex flex-row sm:items-center py-2 sm:py-3">
                          <span className="font-medium text-gray-400 text-sm sm:text-lg mb-1 sm:mb-0">
                            Voter ID:&nbsp;
                          </span>
                          <span className="font-semibold text-gray-50 text-sm sm:text-lg sm:ml-2">
                            {user?.voterId || "N/A"}
                          </span>
                        </div>

                        <div className="flex flex-row sm:items-center py-2 sm:py-3">
                          <span className="font-medium text-gray-400 text-sm sm:text-lg mb-1 sm:mb-0">
                            Verified:&nbsp;
                          </span>
                          <span className={`font-semibold text-sm sm:text-lg sm:ml-2 ${user?.isVerified ? 'text-green-400' : 'text-red-400'}`}>
                            {user?.isVerified ? "Yes" : "No"}
                          </span>
                        </div>

                        <div className="flex flex-row sm:items-center py-2 sm:py-3">
                          <span className="font-medium text-gray-400 text-sm sm:text-lg mb-1 sm:mb-0">
                            Phone:&nbsp;
                          </span>
                          <span className="font-semibold text-gray-50 text-sm sm:text-lg sm:ml-2">
                            {user?.phoneNumber || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
