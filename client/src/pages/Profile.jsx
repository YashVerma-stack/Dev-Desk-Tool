
import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Pencil,
  Lock,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "../services/userService";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Format date
  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Fetch logged-in user's profile
  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await getMyProfile();

      setProfile(response.user);

      setProfileForm({
        name: response.user.name || "",
        email: response.user.email || "",
      });
    } catch (error) {
      console.error("Profile fetch error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Update profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    const name = profileForm.name.trim();
    const email = profileForm.email.trim().toLowerCase();

    if (name.length < 2 || name.length > 100) {
      toast.error("Name must contain 2 to 100 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setSaving(true);

      const response = await updateMyProfile({
        name,
        email,
      });

      setProfile(response.user);

      setProfileForm({
        name: response.user.name,
        email: response.user.email,
      });

      setEditing(false);

      toast.success(
        response.message || "Profile updated successfully"
      );
    } catch (error) {
      console.error("Profile update error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must contain at least 8 characters.");
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      toast.error("New passwords do not match.");
      return;
    }

    if (
      passwordForm.currentPassword ===
      passwordForm.newPassword
    ) {
      toast.error(
        "New password must be different from current password."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await changeMyPassword(passwordForm);

      toast.success(
        response.message || "Password changed successfully"
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setChangingPassword(false);
    } catch (error) {
      console.error("Change password error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to change password"
      );
    } finally {
      setSaving(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading profile...
        </p>
      </div>
    );
  }

  // Error state
  if (!profile) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="font-medium text-red-700">
          Unable to load your profile.
        </p>

        <button
          onClick={fetchProfile}
          className="mt-3 text-sm font-semibold text-blue-600"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your personal information and account security.
        </p>
      </div>

      {/* Profile Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-700">
            {profile.name?.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {profile.name}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {profile.email}
            </p>

            <span className="mt-3 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
              {profile.role}
            </span>
          </div>

          <button
            onClick={() => setEditing(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Pencil size={16} />
            Edit Profile
          </button>

        </div>
      </div>

      {/* Account Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <h2 className="text-lg font-semibold text-gray-900">
          Account Information
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Your registered account details.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">

          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <User size={20} />
            </div>

            <div>
              <p className="text-xs text-gray-500">Full Name</p>
              <p className="mt-1 font-medium text-gray-900">
                {profile.name}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
              <Mail size={20} />
            </div>

            <div>
              <p className="text-xs text-gray-500">Email Address</p>
              <p className="mt-1 break-all font-medium text-gray-900">
                {profile.email}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-green-50 p-3 text-green-600">
              <Shield size={20} />
            </div>

            <div>
              <p className="text-xs text-gray-500">Account Role</p>
              <p className="mt-1 font-medium capitalize text-gray-900">
                {profile.role}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-orange-50 p-3 text-orange-600">
              <Calendar size={20} />
            </div>

            <div>
              <p className="text-xs text-gray-500">Joining Date</p>
              <p className="mt-1 font-medium text-gray-900">
                {formatDate(profile.created_at)}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Account Security */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="flex items-center gap-2">
              <Lock size={20} className="text-gray-600" />

              <h2 className="text-lg font-semibold text-gray-900">
                Account Security
              </h2>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Keep your account secure by updating your password.
            </p>
          </div>

          <button
            onClick={() => setChangingPassword(true)}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Change Password
          </button>

        </div>
      </div>

      {/* Edit Profile Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b p-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Edit Profile
              </h2>

              <button
                onClick={() => setEditing(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-5 p-6">

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      name: e.target.value,
                    })
                  }
                  required
                  minLength={2}
                  maxLength={100}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email Address
                </label>

                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      email: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex justify-end gap-3 border-t pt-5">

                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {changingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b p-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Change Password
              </h2>

              <button
                onClick={() => setChangingPassword(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-5 p-6">

              {[
                {
                  key: "currentPassword",
                  label: "Current Password",
                  visibility: "current",
                },
                {
                  key: "newPassword",
                  label: "New Password",
                  visibility: "new",
                },
                {
                  key: "confirmPassword",
                  label: "Confirm New Password",
                  visibility: "confirm",
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showPasswords[field.visibility]
                          ? "text"
                          : "password"
                      }
                      value={passwordForm[field.key]}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          [field.key]: e.target.value,
                        })
                      }
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-12 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        togglePasswordVisibility(field.visibility)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords[field.visibility] ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              ))}

              <p className="text-xs text-gray-500">
                Your new password must contain at least 8 characters.
              </p>

              <div className="flex justify-end gap-3 border-t pt-5">

                <button
                  type="button"
                  onClick={() => {
                    setChangingPassword(false);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Updating..." : "Update Password"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Profile;
