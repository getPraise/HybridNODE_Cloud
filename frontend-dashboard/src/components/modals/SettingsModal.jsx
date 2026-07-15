import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import axios from "axios";
import { toast } from "react-toastify";
import {
  X,
  User,
  Monitor,
  Shield,
  LogOut,
  Trash2,
  Moon,
  Sun,
  Check,
  Loader2,
} from "lucide-react";

const SettingsModal = ({ isOpen, onClose }) => {
  const { userData, backendUrl, getUserData, isLoggedIn, logout } = useContext(AuthContext);
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState("profile");
  const [newName, setNewName] = useState(userData?.name || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [incognito, setIncognito] = useState(false);

  useEffect(() => {
    if (userData?.name) setNewName(userData.name);
  }, [userData, isOpen]);

  if (!isOpen) return null;

  const isNameChanged = newName !== userData?.name && newName.trim() !== "";

  const handleUpdateName = async () => {
    if (!isNameChanged || isUpdating) return;
    setIsUpdating(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/update-name`, {
        name: newName,
      });
      if (data.success) {
        toast.success("Profile updated successfully");
        await getUserData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleWipeHistory = async () => {
    setIsWiping(true);
    try {
      // Placeholder for your actual delete endpoint
      // const { data } = await axios.delete(`${backendUrl}/api/user/delete-history`);
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API
      toast.success("Workspace history wiped");
    } catch (error) {
      toast.error("Failed to clear history");
    } finally {
      setIsWiping(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: <User size={14} /> },
    { id: "appearance", label: "Appearance", icon: <Monitor size={14} /> },
    { id: "security", label: "Security", icon: <Shield size={14} /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative flex h-[540px] w-full max-w-2xl flex-col overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl transition-all duration-500 md:flex-row dark:border-white/10 dark:bg-slate-900">
        
        {/* 1. SIDEBAR NAVIGATION */}
        <div className="flex w-full flex-col border-r border-slate-200 bg-slate-50 p-6 transition-colors md:w-48 dark:border-white/5 dark:bg-slate-950/50">
          <h2 className="mb-8 text-lg font-black tracking-tight text-slate-950 dark:text-white">
            Settings
          </h2>
          <nav className="flex-1 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-500 hover:text-blue-500"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>

          {isLoggedIn && (
            <button
              onClick={logout}
              className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-500 transition-all hover:bg-red-500/10"
            >
              <LogOut size={14} /> Sign Out
            </button>
          )}
        </div>

        {/* 2. CONTENT AREA */}
        <div className="relative flex-1 overflow-y-auto p-8">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-slate-500 transition-colors hover:text-blue-500"
          >
            <X size={20} />
          </button>

          {/* PROFILE SECTION */}
          {activeTab === "profile" && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
              <header>
                <h3 className="font-bold text-slate-950 dark:text-white">
                  User Profile
                </h3>
                <p className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Identity Details
                </p>
              </header>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-black uppercase text-slate-500">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    disabled={!isLoggedIn || isUpdating}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm font-bold text-slate-900 outline-none transition-all focus:border-blue-600 disabled:opacity-50 dark:border-white/5 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-black uppercase text-slate-500">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={userData?.email || "Guest Session"}
                    disabled={true}
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm font-bold text-slate-500 opacity-70 dark:border-white/5 dark:bg-slate-950 dark:text-slate-400"
                  />
                </div>
              </div>

              {isNameChanged && isLoggedIn && (
                <button
                  onClick={handleUpdateName}
                  disabled={isUpdating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-600/20 transition-all hover:bg-blue-500 disabled:pointer-events-none disabled:opacity-50 animate-in slide-in-from-bottom-2"
                >
                  {isUpdating ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  Save Profile Changes
                </button>
              )}
            </div>
          )}

          {/* APPEARANCE SECTION */}
          {activeTab === "appearance" && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
              <header>
                <h3 className="font-bold text-slate-950 dark:text-white">
                  Interface Theme
                </h3>
                <p className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Workspace Visuals
                </p>
              </header>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setTheme("dark")}
                  className={`rounded-2xl border-2 p-5 text-left transition-all ${
                    theme === "dark"
                      ? "border-blue-600 bg-slate-900 shadow-xl shadow-blue-600/10 dark:bg-slate-950"
                      : "border-transparent bg-slate-50 hover:border-slate-200 dark:bg-slate-900 dark:hover:border-white/10"
                  }`}
                >
                  <Moon
                    className={theme === "dark" ? "text-blue-500" : "text-slate-400"}
                    size={20}
                  />
                  <p className="mt-3 text-xs font-black text-slate-900 dark:text-white">
                    Deep Sea
                  </p>
                  <p className="mt-1 text-[8px] font-bold uppercase tracking-widest text-slate-500">
                    Dark
                  </p>
                </button>

                <button
                  onClick={() => setTheme("light")}
                  className={`rounded-2xl border-2 p-5 text-left transition-all ${
                    theme === "light"
                      ? "border-blue-600 bg-white shadow-xl shadow-blue-600/10"
                      : "border-transparent bg-slate-50 hover:border-slate-200 dark:bg-slate-900 dark:hover:border-white/10"
                  }`}
                >
                  <Sun
                    className={theme === "light" ? "text-blue-600" : "text-slate-500"}
                    size={20}
                  />
                  <p className="mt-3 text-xs font-black text-slate-950 dark:text-slate-400">
                    Pure Onyx
                  </p>
                  <p className="mt-1 text-[8px] font-bold uppercase tracking-widest text-slate-500">
                    Light
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* SECURITY SECTION */}
          {activeTab === "security" && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
              <header>
                <h3 className="font-bold text-slate-950 dark:text-white">
                  Data Security
                </h3>
                <p className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Manage Session History
                </p>
              </header>

              <div className="space-y-3">
                <button
                  onClick={handleWipeHistory}
                  disabled={isWiping}
                  className="group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-red-500/30 disabled:pointer-events-none disabled:opacity-50 dark:border-white/5 dark:bg-slate-950 dark:hover:border-red-500/30"
                >
                  <div className="text-left">
                    <p className="text-[11px] font-black uppercase tracking-wide text-slate-900 transition-colors group-hover:text-red-500 dark:text-white">
                      Wipe History
                    </p>
                    <p className="text-[9px] font-medium text-slate-500">
                      Delete all session history permanently
                    </p>
                  </div>
                  {isWiping ? (
                    <Loader2 size={16} className="animate-spin text-red-500" />
                  ) : (
                    <Trash2
                      size={16}
                      className="text-slate-400 transition-colors group-hover:text-red-500"
                    />
                  )}
                </button>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors dark:border-white/5 dark:bg-slate-950">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wide text-slate-900 dark:text-white">
                      Incognito Mode
                    </p>
                    <p className="text-[9px] font-medium text-slate-500">
                      Prevent session storage for this instance
                    </p>
                  </div>
                  <button
                    onClick={() => setIncognito(!incognito)}
                    className={`relative h-5 w-10 rounded-full transition-colors ${
                      incognito ? "bg-blue-600" : "bg-slate-400 dark:bg-slate-600"
                    }`}
                  >
                    <div
                      className={`absolute top-1 h-3 w-3 rounded-full bg-white transition-all ${
                        incognito ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;