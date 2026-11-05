
import { useState, useEffect, useCallback } from "react";

import {
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  X,
  UserCircle,
  Check,
  CheckCheck,
  LoaderCircle,
  Layers,
} from "lucide-react";

import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";

import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "../../services/userService";

import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notificationService";

function DashboardLayout({ children }) {
  const { user, setUser, logout } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modal, setModal] = useState(null);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [accountProfile, setAccountProfile] = useState(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationActionLoading, setNotificationActionLoading] =
    useState(false);

  // Generate user initials
  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .trim()
      .split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // ==========================================
  // NOTIFICATION FUNCTIONALITY
  // ==========================================

  const fetchNotifications = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setNotificationLoading(true);
    }

    try {
      const [notificationResponse, countResponse] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);

      setNotifications(notificationResponse.notifications || []);
      setUnreadCount(countResponse.unreadCount || 0);
    } catch (error) {
      console.error(
        "Failed to fetch notifications:",
        error.response?.data?.message || error.message
      );
    } finally {
      if (showLoading) {
        setNotificationLoading(false);
      }
    }
  }, []);

  // Initial fetch and automatic polling every 15 seconds
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleNotificationToggle = () => {
    const nextState = !notificationOpen;

    setNotificationOpen(nextState);

    if (nextState) {
      setDropdownOpen(false);
      fetchNotifications(true);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      await fetchNotifications();
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || notificationActionLoading) return;

    setNotificationActionLoading(true);

    try {
      await markAllNotificationsAsRead();
      await fetchNotifications();
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error.response?.data?.message || error.message
      );
    } finally {
      setNotificationActionLoading(false);
    }
  };

  const formatNotificationTime = (date) => {
    const notificationDate = new Date(date);

    return notificationDate.toLocaleString([], {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // PROFILE FUNCTIONALITY
  // ==========================================

  const openAccountProfile = async () => {
    setDropdownOpen(false);
    setMessage("");
    setSaving(true);

    try {
      const response = await getMyProfile();

      setAccountProfile(response.user);
      setModal("account-profile");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to load profile details."
      );
    } finally {
      setSaving(false);
    }
  };

  const openProfileModal = () => {
    setProfileData({
      name: user?.name || "",
      email: user?.email || "",
    });

    setMessage("");
    setModal("profile");
    setDropdownOpen(false);
  };

  const openPasswordModal = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setMessage("");
    setModal("password");
    setDropdownOpen(false);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await updateMyProfile(profileData);

      setUser((prev) => ({
        ...prev,
        ...response.user,
      }));

      setMessage("Profile updated successfully.");
      setModal(null);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAccountProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await updateMyProfile({
        name: accountProfile.name,
        email: accountProfile.email,
      });

      setUser((prev) => ({
        ...prev,
        ...response.user,
      }));

      setAccountProfile(response.user);
      setModal(null);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("New password and confirm password do not match.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await changeMyPassword(passwordData);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setModal(null);
      alert("Password changed successfully.");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to change password."
      );
    } finally {
      setSaving(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    setDropdownOpen(false);
    setNotificationOpen(false);
    await logout();
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f6fa]">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Application */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">

        {/* Top Navbar */}
        <header className="relative z-40 flex h-[72px] shrink-0 items-center justify-between border-b border-[#e9e7f1] bg-[#f8f6ff] px-4 sm:px-6 lg:px-8">

          {/* Left Section */}
          <div className="flex min-w-0 flex-1 items-center gap-4">

            {/* Brand - visible on smaller screens when sidebar is hidden */}
            <div className="flex shrink-0 items-center gap-2 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#f05218] to-[#c63208] text-white shadow-sm">
                <Layers size={19} />
              </div>

              <span className="text-base font-bold text-[#171827]">
                DevDesk
              </span>
            </div>

            {/* Search */}
            <div className="flex w-full max-w-[360px] items-center gap-3 rounded-xl border border-[#e7e5ed] bg-white px-4 py-2.5 transition focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100">
              <Search size={18} className="shrink-0 text-[#9696a8]" />

              <input
                type="text"
                placeholder="Search anything..."
                className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-[#9999aa]"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="ml-3 flex shrink-0 items-center gap-3 sm:gap-5">

            {/* Notifications */}
            <div className="relative">

              <button
                type="button"
                onClick={handleNotificationToggle}
                className={`relative flex h-10 w-10 items-center justify-center rounded-full transition ${
                  notificationOpen
                    ? "bg-orange-50 text-[#d9430d]"
                    : "text-[#73758a] hover:bg-white hover:text-[#d9430d]"
                }`}
                aria-label="Notifications"
              >
                <Bell size={20} />

                {unreadCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#e84b15] px-1 text-[9px] font-bold text-white ring-2 ring-[#f8f6ff]">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Panel */}
              {notificationOpen && (
                <div className="absolute right-0 top-12 z-50 w-[380px] max-w-[90vw] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_15px_50px_rgba(30,30,50,0.14)]">

                  <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">
                        Notifications
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        {unreadCount} unread notifications
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      disabled={
                        unreadCount === 0 ||
                        notificationActionLoading
                      }
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#d9430d] transition hover:text-[#a92d04] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {notificationActionLoading ? (
                        <LoaderCircle
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <CheckCheck size={15} />
                      )}

                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto">

                    {notificationLoading ? (
                      <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
                        <LoaderCircle
                          size={18}
                          className="animate-spin"
                        />
                        Loading notifications...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <Bell size={30} className="mb-2" />

                        <p className="text-sm font-medium">
                          No notifications yet
                        </p>

                        <p className="mt-1 text-xs">
                          You're all caught up!
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex gap-3 border-b border-gray-100 px-5 py-4 transition hover:bg-orange-50/30 ${
                            !notification.is_read
                              ? "bg-orange-50/40"
                              : ""
                          }`}
                        >
                          <div className="mt-1">
                            <span
                              className={`block h-2.5 w-2.5 rounded-full ${
                                notification.is_read
                                  ? "bg-gray-300"
                                  : "bg-[#e84b15]"
                              }`}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-semibold text-gray-800">
                                {notification.title}
                              </h4>

                              {!notification.is_read && (
                                <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-[#c83c0b]">
                                  New
                                </span>
                              )}
                            </div>

                            <p className="mt-1 break-words text-sm text-gray-600">
                              {notification.message}
                            </p>

                            <div className="mt-2 flex items-center justify-between gap-2">
                              <span className="text-xs text-gray-400">
                                {formatNotificationTime(
                                  notification.created_at
                                )}
                              </span>

                              {!notification.is_read && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleMarkAsRead(notification.id)
                                  }
                                  className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#d9430d] hover:text-[#a92d04]"
                                >
                                  <Check size={13} />
                                  Mark as read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="border-t border-gray-100 px-4 py-3 text-center">
                      <p className="text-xs text-gray-400">
                        Showing your latest {notifications.length} notifications
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">

              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(!dropdownOpen);
                  setNotificationOpen(false);
                }}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-white sm:gap-3 sm:pr-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dce9ff] text-sm font-bold text-[#2463d8]">
                  {getInitials(user?.name)}
                </div>

                <div className="hidden text-left sm:block">
                  <p className="max-w-[110px] truncate text-sm font-bold text-[#202238]">
                    {user?.name || "User"}
                  </p>

                  <p className="text-xs capitalize text-[#85869a]">
                    {user?.role || "Member"}
                  </p>
                </div>

                <ChevronDown
                  size={16}
                  className={`hidden text-[#77788c] transition sm:block ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-14 z-50 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white py-2 shadow-[0_15px_50px_rgba(30,30,50,0.14)]">

                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-sm font-bold text-gray-800">
                      {user?.name}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {user?.email}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={openAccountProfile}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-orange-50 hover:text-[#c83c0b]"
                  >
                    <UserCircle size={17} />
                    Profile
                  </button>

                  <button
                    type="button"
                    onClick={openProfileModal}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-orange-50 hover:text-[#c83c0b]"
                  >
                    <User size={17} />
                    Edit Profile
                  </button>

                  <button
                    type="button"
                    onClick={openPasswordModal}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-orange-50 hover:text-[#c83c0b]"
                  >
                    <Settings size={17} />
                    Change Password
                  </button>

                  <div className="my-1 border-t border-gray-100" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Profile / Password Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111827]/50 p-4 backdrop-blur-[2px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setModal(null);
              setMessage("");
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">

            {/* Modal Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {modal === "account-profile"
                  ? "My Profile"
                  : modal === "profile"
                  ? "Edit Profile"
                  : "Change Password"}
              </h2>

              <button
                type="button"
                onClick={() => {
                  setModal(null);
                  setMessage("");
                }}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-orange-50 hover:text-[#c83c0b]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Account Profile Details */}
            {modal === "account-profile" && accountProfile && (
              <form
                onSubmit={handleAccountProfileUpdate}
                className="space-y-4"
              >
                <div className="flex flex-col items-center py-3">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-[#c83c0b]">
                    {getInitials(accountProfile.name)}
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-gray-800">
                    {accountProfile.name}
                  </h3>

                  <span className="mt-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold capitalize text-[#c83c0b]">
                    {accountProfile.role}
                  </span>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    User ID
                  </label>

                  <input
                    value={accountProfile.id || ""}
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Full Name
                  </label>

                  <input
                    type="text"
                    required
                    minLength={2}
                    value={accountProfile.name || ""}
                    onChange={(e) =>
                      setAccountProfile({
                        ...accountProfile,
                        name: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Email Address
                  </label>

                  <input
                    type="email"
                    required
                    value={accountProfile.email || ""}
                    onChange={(e) =>
                      setAccountProfile({
                        ...accountProfile,
                        email: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Role
                  </label>

                  <input
                    value={accountProfile.role || ""}
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm capitalize text-gray-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Account Created
                  </label>

                  <input
                    value={
                      accountProfile.created_at
                        ? new Date(
                            accountProfile.created_at
                          ).toLocaleString()
                        : "Not available"
                    }
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Last Updated
                  </label>

                  <input
                    value={
                      accountProfile.updated_at
                        ? new Date(
                            accountProfile.updated_at
                          ).toLocaleString()
                        : "Not available"
                    }
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-gradient-to-r from-[#e84b15] to-[#bd3105] py-3 text-sm font-semibold text-white transition hover:shadow-lg disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}

            {/* Edit Profile */}
            {modal === "profile" && (
              <form
                onSubmit={handleProfileUpdate}
                className="space-y-4"
              >
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    required
                    minLength={2}
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        name: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email Address
                  </label>

                  <input
                    type="email"
                    required
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        email: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-gradient-to-r from-[#e84b15] to-[#bd3105] py-3 text-sm font-semibold text-white transition hover:shadow-lg disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}

            {/* Change Password */}
            {modal === "password" && (
              <form
                onSubmit={handlePasswordUpdate}
                className="space-y-4"
              >
                {[
                  ["currentPassword", "Current Password"],
                  ["newPassword", "New Password"],
                  ["confirmPassword", "Confirm New Password"],
                ].map(([field, label]) => (
                  <div key={field}>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {label}
                    </label>

                    <input
                      type="password"
                      required
                      minLength={field === "currentPassword" ? undefined : 8}
                      value={passwordData[field]}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          [field]: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-gradient-to-r from-[#e84b15] to-[#bd3105] py-3 text-sm font-semibold text-white transition hover:shadow-lg disabled:opacity-60"
                >
                  {saving ? "Updating..." : "Change Password"}
                </button>
              </form>
            )}

            {message && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardLayout;
