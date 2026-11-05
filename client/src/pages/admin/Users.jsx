
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  RotateCcw,
  Users as UsersIcon,
  User,
  ShieldCheck,
  UserCheck,
  CalendarDays,
  FolderKanban,
  ClipboardList,
  AlertCircle,
  LoaderCircle,
  Mail,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  getUsers,
  getUserWorkDetails,
  updateUser,
  deleteUser,
  restoreUser,
} from "../../services/userService";

function Users() {
  const [users, setUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [viewLoading, setViewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [restoringUser, setRestoringUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "member",
  });

  const [error, setError] = useState("");

  // Fetch users from backend
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getUsers();
      const allUsers = response.users || [];

      setUsers(allUsers.filter((user) => !user.is_deleted));
      setDeletedUsers(allUsers.filter((user) => user.is_deleted));
    } catch (err) {
      console.error("Fetch users error:", err);

      toast.error(
        err.response?.data?.message || "Failed to fetch users"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Active or deleted users
  const currentUsers =
    activeTab === "active" ? users : deletedUsers;

  // Search users
  const filteredUsers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return currentUsers.filter((user) => {
      return (
        user.name?.toLowerCase().includes(searchValue) ||
        user.email?.toLowerCase().includes(searchValue) ||
        user.role?.toLowerCase().includes(searchValue) ||
        String(user.id).includes(searchValue)
      );
    });
  }, [currentUsers, search]);

  // User statistics
  const adminCount = users.filter(
    (user) => user.role === "admin"
  ).length;

  const memberCount = users.filter(
    (user) => user.role === "member"
  ).length;

  // Format dates
  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Get user initials
  const getInitials = (name = "") => {
    return (
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "U"
    );
  };

  // Avatar colors
  const avatarColors = [
    "bg-orange-100 text-orange-700",
    "bg-blue-100 text-blue-700",
    "bg-violet-100 text-violet-700",
    "bg-emerald-100 text-emerald-700",
    "bg-rose-100 text-rose-700",
  ];

  // View complete user details and work assignments
  const handleViewUser = async (user) => {
    try {
      setViewLoading(true);
      setSelectedUser(null);

      const response = await getUserWorkDetails(user.id);

      setSelectedUser({
        user: response.user,
        projects: response.projects || [],
        assignedIssues: response.assignedIssues || [],
      });
    } catch (err) {
      console.error("View user work details error:", err);

      toast.error(
        err.response?.data?.message ||
          "Failed to fetch user work details"
      );
    } finally {
      setViewLoading(false);
    }
  };

  // Open edit modal
  const handleEditUser = (user) => {
    setEditingUser(user);

    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "member",
    });

    setError("");
  };

  // Close edit modal
  const handleCloseEdit = () => {
    setEditingUser(null);

    setFormData({
      name: "",
      email: "",
      role: "member",
    });

    setError("");
  };

  // Update user
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();

    if (name.length < 2 || name.length > 100) {
      setError("Name must contain 2 to 100 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await updateUser(editingUser.id, {
        name,
        email,
        role: formData.role,
      });

      const updatedUser = response.user;

      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user.id === editingUser.id ? updatedUser : user
        )
      );

      // Update nested selected user state
      if (selectedUser?.user?.id === editingUser.id) {
        setSelectedUser((previous) => ({
          ...previous,
          user: {
            ...previous.user,
            ...updatedUser,
          },
        }));
      }

      handleCloseEdit();

      toast.success(
        response.message || "User updated successfully"
      );
    } catch (err) {
      console.error("Update user error:", err);

      const message =
        err.response?.data?.message ||
        "Failed to update user";

      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Open delete confirmation
  const handleDeleteUser = (user) => {
    setDeletingUser(user);
  };

  // Cancel deletion
  const handleCancelDelete = () => {
    setDeletingUser(null);
  };

  // Delete user
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    try {
      setActionLoading(true);

      const response = await deleteUser(deletingUser.id);

      setDeletingUser(null);

      if (selectedUser?.user?.id === deletingUser.id) {
        setSelectedUser(null);
      }

      await fetchUsers();

      toast.success(
        response.message || "User deleted successfully"
      );
    } catch (err) {
      console.error("Delete user error:", err);

      toast.error(
        err.response?.data?.message ||
          "Failed to delete user"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Open restore confirmation
  const handleRestoreUser = (user) => {
    setRestoringUser(user);
  };

  // Cancel restore
  const handleCancelRestore = () => {
    setRestoringUser(null);
  };

  // Restore user
  const handleConfirmRestore = async () => {
    if (!restoringUser) return;

    try {
      setActionLoading(true);

      const response = await restoreUser(restoringUser.id);

      setRestoringUser(null);

      await fetchUsers();

      toast.success(
        response.message || "User restored successfully"
      );
    } catch (err) {
      console.error("Restore user error:", err);

      toast.error(
        err.response?.data?.message ||
          "Failed to restore user"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Priority/status styles for assigned issues
  const getIssueStatusStyle = (status) => {
    const styles = {
      open: "bg-blue-50 text-blue-700",
      in_progress: "bg-orange-50 text-orange-700",
      resolved: "bg-emerald-50 text-emerald-700",
      closed: "bg-slate-100 text-slate-600",
    };

    return styles[status] || "bg-slate-100 text-slate-600";
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      critical: "bg-red-50 text-red-700",
      high: "bg-orange-50 text-orange-700",
      medium: "bg-amber-50 text-amber-700",
      low: "bg-emerald-50 text-emerald-700",
    };

    return styles[priority] || "bg-slate-100 text-slate-600";
  };

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5 pb-8">

      {/* PAGE HEADER */}
      <section className="rounded-[28px] border border-white bg-white p-5 shadow-[0_12px_40px_rgba(35,31,75,0.045)] sm:p-7">

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-700">
              <UsersIcon size={13} />
              Workspace directory
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              User Management
            </h1>

            <p className="mt-1.5 text-sm text-slate-500">
              Manage registered users, account roles, and workspace access.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <UsersIcon size={18} className="text-orange-600" />

            <div>
              <p className="text-xs font-semibold text-slate-800">
                Workspace members
              </p>
              <p className="text-[10px] text-slate-400">
                User administration
              </p>
            </div>
          </div>
        </div>

        {/* WORKSPACE BANNER */}
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50/90 to-white px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
            <ShieldCheck size={17} />
          </span>

          <div>
            <p className="text-xs font-semibold text-slate-800">
              Workspace access management
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Manage account information, roles, and user activity.
            </p>
          </div>
        </div>
      </section>

      {/* SUMMARY CARDS */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <article className="rounded-[24px] border border-white bg-white p-5 shadow-[0_8px_28px_rgba(35,31,75,0.035)] transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <UsersIcon size={20} />
            </span>

            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
              Active
            </span>
          </div>

          <p className="mt-4 text-3xl font-bold text-slate-950">
            {users.length}
          </p>

          <h2 className="mt-1 text-sm font-semibold text-slate-800">
            Active Users
          </h2>

          <p className="mt-1 text-[11px] text-slate-400">
            Registered workspace accounts
          </p>
        </article>

        <article className="rounded-[24px] border border-white bg-white p-5 shadow-[0_8px_28px_rgba(35,31,75,0.035)] transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <ShieldCheck size={20} />
            </span>

            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700">
              Admin
            </span>
          </div>

          <p className="mt-4 text-3xl font-bold text-slate-950">
            {adminCount}
          </p>

          <h2 className="mt-1 text-sm font-semibold text-slate-800">
            Administrators
          </h2>

          <p className="mt-1 text-[11px] text-slate-400">
            Users with administrative access
          </p>
        </article>

        <article className="rounded-[24px] border border-white bg-white p-5 shadow-[0_8px_28px_rgba(35,31,75,0.035)] transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <UserCheck size={20} />
            </span>

            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
              Members
            </span>
          </div>

          <p className="mt-4 text-3xl font-bold text-slate-950">
            {memberCount}
          </p>

          <h2 className="mt-1 text-sm font-semibold text-slate-800">
            Team Members
          </h2>

          <p className="mt-1 text-[11px] text-slate-400">
            Active project members
          </p>
        </article>
      </section>

      {/* USER DIRECTORY */}
      <section className="overflow-hidden rounded-[26px] border border-white bg-white shadow-[0_8px_28px_rgba(35,31,75,0.035)]">

        {/* HEADER AND SEARCH */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center">

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                User Accounts
              </h2>

              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-700">
                {filteredUsers.length} Users
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              View and manage registered workspace accounts.
            </p>
          </div>

          <div className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 lg:w-80">
            <Search size={17} className="shrink-0 text-slate-400" />

            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-slate-400 hover:text-slate-700"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* ACTIVE / DELETED TABS */}
        <div className="flex gap-2 border-b border-slate-100 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab("active");
              setSearch("");
            }}
            className={`border-b-2 px-3 py-4 text-xs font-semibold transition sm:px-4 ${
              activeTab === "active"
                ? "border-orange-600 text-orange-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Active Users ({users.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("deleted");
              setSearch("");
            }}
            className={`border-b-2 px-3 py-4 text-xs font-semibold transition sm:px-4 ${
              activeTab === "deleted"
                ? "border-orange-600 text-orange-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Deleted Users ({deletedUsers.length})
          </button>
        </div>

        {/* USER LIST */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-14 text-sm text-slate-500">
            <LoaderCircle size={18} className="animate-spin" />
            Loading users...
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="space-y-2.5 p-4 sm:p-5">

            {filteredUsers.map((user, index) => (
              <article
                key={user.id}
                className="group flex flex-col justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-orange-100 hover:bg-[#fcfbff] hover:shadow-sm sm:flex-row sm:items-center"
              >
                {/* USER INFORMATION */}
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${
                      avatarColors[index % avatarColors.length]
                    }`}
                  >
                    {getInitials(user.name)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-slate-900">
                        {user.name}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${
                          user.role === "admin"
                            ? "bg-violet-50 text-violet-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {user.role}
                      </span>

                      {activeTab === "deleted" && (
                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-600">
                          Deleted
                        </span>
                      )}
                    </div>

                    <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
                      <Mail size={12} className="shrink-0 text-slate-400" />
                      {user.email}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={12} />
                        Joined {formatDate(user.created_at)}
                      </span>

                      <span className="text-slate-300">
                        ID: #{user.id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* USER ACTIONS */}
                <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">

                  <button
                    type="button"
                    onClick={() => handleViewUser(user)}
                    title="View user"
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Eye size={15} />
                    View Details
                  </button>

                  {activeTab === "active" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleEditUser(user)}
                        title="Edit user"
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-orange-50 hover:text-orange-700"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user)}
                        title="Delete user"
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRestoreUser(user)}
                      title="Restore user"
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      <RotateCcw size={15} />
                      Restore
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <UsersIcon size={26} />
            </span>

            <h3 className="mt-4 text-sm font-semibold text-slate-700">
              No users found
            </h3>

            <p className="mt-1 max-w-sm text-xs text-slate-400">
              {search
                ? "Try searching with another name, email, role, or user ID."
                : activeTab === "deleted"
                  ? "There are no deleted users."
                  : "There are no active users to display."}
            </p>
          </div>
        )}

        {/* FOOTER */}
        <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-400 sm:px-6">
          Showing {filteredUsers.length} of {currentUsers.length} users
        </div>
      </section>

      {/* VIEW USER WORK DETAILS MODAL */}
      {(viewLoading || selectedUser) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[25px] bg-white shadow-2xl">

            {viewLoading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <LoaderCircle
                  size={34}
                  className="animate-spin text-orange-600"
                />

                <p className="mt-4 text-sm text-slate-500">
                  Loading user work details...
                </p>
              </div>
            ) : selectedUser && (
              <>
                {/* MODAL HEADER */}
                <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                      Workspace directory
                    </span>

                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      User Work Details
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Personal information, projects, and assigned issues.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6 p-5 sm:p-6">

                  {/* USER PROFILE */}
                  <div className="flex flex-col gap-4 rounded-2xl bg-orange-50 p-5 sm:flex-row sm:items-center">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-xl font-bold text-orange-700">
                      {getInitials(selectedUser.user.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-xl font-bold text-slate-900">
                        {selectedUser.user.name}
                      </h3>

                      <p className="mt-1 break-all text-sm text-slate-500">
                        {selectedUser.user.email}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-semibold capitalize ${
                            selectedUser.user.role === "admin"
                              ? "bg-violet-100 text-violet-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {selectedUser.user.role}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                            selectedUser.user.is_deleted
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {selectedUser.user.is_deleted
                            ? "Deleted"
                            : "Active"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PERSONAL INFORMATION */}
                  <section>
                    <h3 className="mb-3 text-sm font-bold text-slate-900">
                      Personal Information
                    </h3>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {[
                        ["User ID", `#${selectedUser.user.id}`],
                        ["Role", selectedUser.user.role],
                        ["Email", selectedUser.user.email],
                        [
                          "Joining Date",
                          formatDate(selectedUser.user.created_at),
                        ],
                        [
                          "Last Updated",
                          formatDate(selectedUser.user.updated_at),
                        ],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                        >
                          <p className="text-[11px] text-slate-400">
                            {label}
                          </p>

                          <p className="mt-1 break-words text-sm font-semibold capitalize text-slate-800">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* WORK SUMMARY */}
                  <section>
                    <h3 className="mb-3 text-sm font-bold text-slate-900">
                      Work Summary
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-slate-100 bg-white p-4">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                          <FolderKanban size={18} />
                        </span>

                        <p className="mt-3 text-2xl font-bold text-slate-900">
                          {selectedUser.projects.length}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Assigned Projects
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-white p-4">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                          <ClipboardList size={18} />
                        </span>

                        <p className="mt-3 text-2xl font-bold text-slate-900">
                          {selectedUser.assignedIssues.length}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Assigned Issues
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* ASSIGNED PROJECTS */}
                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Assigned Projects
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          Projects this user is a member of.
                        </p>
                      </div>

                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                        {selectedUser.projects.length} Projects
                      </span>
                    </div>

                    {selectedUser.projects.length === 0 ? (
                      <div className="rounded-xl bg-slate-50 p-7 text-center">
                        <FolderKanban
                          size={25}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-2 text-xs text-slate-500">
                          This user is not assigned to any project.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedUser.projects.map((project) => (
                          <div
                            key={project.id}
                            className="rounded-xl border border-slate-100 p-4 transition hover:border-orange-100"
                          >
                            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                              <h4 className="text-sm font-semibold text-slate-900">
                                {project.name}
                              </h4>

                              <span className="w-fit rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                                Project #{project.id}
                              </span>
                            </div>

                            <p className="mt-2 text-xs leading-5 text-slate-500">
                              {project.description ||
                                "No description available"}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <User size={12} />
                                Owner: {project.owner_name || "Unknown"}
                              </span>

                              <span className="flex items-center gap-1">
                                <CalendarDays size={12} />
                                Assigned: {formatDate(project.assigned_at)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* ASSIGNED ISSUES */}
                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Assigned Issues
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          Issues assigned to this user.
                        </p>
                      </div>

                      <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700">
                        {selectedUser.assignedIssues.length} Issues
                      </span>
                    </div>

                    {selectedUser.assignedIssues.length === 0 ? (
                      <div className="rounded-xl bg-slate-50 p-7 text-center">
                        <ClipboardList
                          size={25}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-2 text-xs text-slate-500">
                          No issues are currently assigned to this user.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedUser.assignedIssues.map((issue) => (
                          <div
                            key={issue.id}
                            className="rounded-xl border border-slate-100 p-4 transition hover:border-orange-100"
                          >
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                              <div className="min-w-0">
                                <h4 className="break-words text-sm font-semibold text-slate-900">
                                  {issue.title}
                                </h4>

                                <p className="mt-1 text-xs text-slate-500">
                                  {issue.project_name}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <span
                                  className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${getIssueStatusStyle(issue.status)}`}
                                >
                                  {issue.status?.replace("_", " ")}
                                </span>

                                <span
                                  className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${getPriorityStyle(issue.priority)}`}
                                >
                                  {issue.priority}
                                </span>
                              </div>
                            </div>

                            <p className="mt-3 text-xs leading-5 text-slate-500">
                              {issue.description ||
                                "No description available"}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-400">
                              <span>Issue ID: #{issue.id}</span>

                              <span>
                                Created by: {issue.creator_name || "Unknown"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>

                {/* MODAL FOOTER */}
                <div className="flex justify-end border-t border-slate-100 p-5 sm:px-6">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-[25px] bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                  Account management
                </span>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Edit User
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Update user information and role.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseEdit}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleEditSubmit}
              className="space-y-5 p-5 sm:p-6"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>

                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((previous) => ({
                      ...previous,
                      name: e.target.value,
                    }));

                    setError("");
                  }}
                  minLength={2}
                  maxLength={100}
                  required
                  placeholder="Enter full name"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((previous) => ({
                      ...previous,
                      email: e.target.value,
                    }));

                    setError("");
                  }}
                  required
                  placeholder="Enter email address"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  User Role
                </label>

                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((previous) => ({
                      ...previous,
                      role: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting && (
                    <LoaderCircle size={16} className="animate-spin" />
                  )}

                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE USER MODAL */}
      {deletingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[25px] bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <h2 className="text-lg font-bold text-slate-900">
                Delete User
              </h2>

              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={actionLoading}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Trash2 size={22} />
              </div>

              <h3 className="text-base font-bold text-slate-900">
                Are you sure you want to delete this user?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                You are about to delete{" "}
                <span className="font-semibold text-slate-800">
                  {deletingUser.name}
                </span>
                . This user will be moved to the deleted users list.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 p-5">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={actionLoading}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {actionLoading && (
                  <LoaderCircle size={15} className="animate-spin" />
                )}

                {actionLoading ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESTORE USER MODAL */}
      {restoringUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[25px] bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <h2 className="text-lg font-bold text-slate-900">
                Restore User
              </h2>

              <button
                type="button"
                onClick={handleCancelRestore}
                disabled={actionLoading}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <RotateCcw size={22} />
              </div>

              <h3 className="text-base font-bold text-slate-900">
                Restore this user account?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                <span className="font-semibold text-slate-800">
                  {restoringUser.name}
                </span>{" "}
                will be moved back to the active users list.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 p-5">
              <button
                type="button"
                onClick={handleCancelRestore}
                disabled={actionLoading}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmRestore}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {actionLoading && (
                  <LoaderCircle size={15} className="animate-spin" />
                )}

                {actionLoading ? "Restoring..." : "Restore User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
