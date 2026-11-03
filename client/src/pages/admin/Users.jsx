
import { useState } from "react";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  RotateCcw,
  Users as UsersIcon,
} from "lucide-react";

const initialUsers = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@example.com",
    role: "member",
    created_at: "2026-10-10T10:30:00",
    updated_at: "2026-10-15T12:30:00",
  },
  {
    id: 2,
    name: "Priya Singh",
    email: "priya@example.com",
    role: "admin",
    created_at: "2026-10-12T09:15:00",
    updated_at: "2026-10-18T11:20:00",
  },
  {
    id: 3,
    name: "Amit Verma",
    email: "amit@example.com",
    role: "member",
    created_at: "2026-10-15T14:20:00",
    updated_at: "2026-10-20T10:00:00",
  },
  {
    id: 4,
    name: "Neha Gupta",
    email: "neha@example.com",
    role: "member",
    created_at: "2026-10-18T11:45:00",
    updated_at: "2026-10-22T16:30:00",
  },
];

function Users() {
  const [users, setUsers] = useState(initialUsers);
  const [deletedUsers, setDeletedUsers] = useState([]);

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

  // Search users
  const currentUsers =
    activeTab === "active" ? users : deletedUsers;

  const filteredUsers = currentUsers.filter((user) => {
    const searchValue = search.toLowerCase();

    return (
      user.name.toLowerCase().includes(searchValue) ||
      user.email.toLowerCase().includes(searchValue) ||
      user.role.toLowerCase().includes(searchValue)
    );
  });

  // Format dates
  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // View user
  const handleViewUser = (user) => {
    setSelectedUser(user);
  };

  // Open edit modal
  const handleEditUser = (user) => {
    setEditingUser(user);

    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
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
  const handleEditSubmit = (e) => {
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

    const emailExists = users.some(
      (user) =>
        user.email.toLowerCase() === email &&
        user.id !== editingUser.id
    );

    if (emailExists) {
      setError("This email is already registered.");
      return;
    }

    const updatedUser = {
      ...editingUser,
      name,
      email,
      role: formData.role,
      updated_at: new Date().toISOString(),
    };

    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === editingUser.id ? updatedUser : user
      )
    );

    if (selectedUser?.id === editingUser.id) {
      setSelectedUser(updatedUser);
    }

    handleCloseEdit();
  };

  // Open delete confirmation
  const handleDeleteUser = (user) => {
    setDeletingUser(user);
  };

  // Cancel deletion
  const handleCancelDelete = () => {
    setDeletingUser(null);
  };

  // Confirm deletion (static soft-delete simulation)
  const handleConfirmDelete = () => {
    if (!deletingUser) return;

    const deletedUser = {
      ...deletingUser,
      is_deleted: true,
      updated_at: new Date().toISOString(),
    };

    setUsers((prevUsers) =>
      prevUsers.filter((user) => user.id !== deletingUser.id)
    );

    setDeletedUsers((prevUsers) => [
      deletedUser,
      ...prevUsers,
    ]);

    if (selectedUser?.id === deletingUser.id) {
      setSelectedUser(null);
    }

    setDeletingUser(null);
  };

  // Open restore confirmation
  const handleRestoreUser = (user) => {
    setRestoringUser(user);
  };

  // Cancel restore
  const handleCancelRestore = () => {
    setRestoringUser(null);
  };

  // Confirm restore
  const handleConfirmRestore = () => {
    if (!restoringUser) return;

    const restoredUser = {
      ...restoringUser,
      is_deleted: false,
      updated_at: new Date().toISOString(),
    };

    setDeletedUsers((prevUsers) =>
      prevUsers.filter((user) => user.id !== restoringUser.id)
    );

    setUsers((prevUsers) => [
      restoredUser,
      ...prevUsers,
    ]);

    setRestoringUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Users Management
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage registered users and their roles.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Active Users</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {users.length}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Administrators</p>
          <h2 className="mt-2 text-2xl font-bold text-blue-600">
            {users.filter((user) => user.role === "admin").length}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Deleted Users</p>
          <h2 className="mt-2 text-2xl font-bold text-red-600">
            {deletedUsers.length}
          </h2>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* Table Header */}
        <div className="flex flex-col gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              User Accounts
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              View and manage registered accounts.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Active / Deleted Tabs */}
        <div className="flex gap-6 border-b border-gray-200 px-5">
          <button
            onClick={() => {
              setActiveTab("active");
              setSearch("");
            }}
            className={`border-b-2 py-4 text-sm font-medium ${
              activeTab === "active"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Active Users ({users.length})
          </button>

          <button
            onClick={() => {
              setActiveTab("deleted");
              setSearch("");
            }}
            className={`border-b-2 py-4 text-sm font-medium ${
              activeTab === "deleted"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Deleted Users ({deletedUsers.length})
          </button>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                  User
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                  Role
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                  Joined Date
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                        {user.name.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <p className="font-medium text-gray-900">
                          {user.name}
                        </p>

                        <p className="text-sm text-gray-500">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {user.role === "admin" ? "Admin" : "Member"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(user.created_at)}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        title="View User"
                        className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye size={17} />
                      </button>

                      {activeTab === "active" ? (
                        <>
                          <button
                            onClick={() => handleEditUser(user)}
                            title="Edit User"
                            className="rounded-lg p-2 text-gray-500 hover:bg-amber-50 hover:text-amber-600"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user)}
                            title="Delete User"
                            className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={17} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestoreUser(user)}
                          title="Restore User"
                          className="rounded-lg p-2 text-gray-500 hover:bg-green-50 hover:text-green-600"
                        >
                          <RotateCcw size={17} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center"
                  >
                    <UsersIcon
                      size={30}
                      className="mx-auto mb-2 text-gray-300"
                    />

                    <p className="text-sm font-medium text-gray-600">
                      No users found.
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {activeTab === "deleted"
                        ? "There are no deleted users."
                        : "Try another search term."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="border-t border-gray-200 px-6 py-4 text-sm text-gray-500">
          Showing {filteredUsers.length} of {currentUsers.length} users
        </div>
      </div>

      {/* View User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900">
                User Details
              </h2>

              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedUser.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">User ID</p>
                  <p className="mt-1 font-medium text-gray-900">
                    #{selectedUser.id}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="mt-1 font-medium capitalize text-gray-900">
                    {selectedUser.role}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Joined Date</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {formatDate(selectedUser.created_at)}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {formatDate(selectedUser.updated_at)}
                  </p>
                </div>
              </div>

              {selectedUser.is_deleted && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  This account is currently deleted.
                </p>
              )}
            </div>

            <div className="flex justify-end border-t border-gray-200 p-5">
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Edit User
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update user information and role.
                </p>
              </div>

              <button
                onClick={handleCloseEdit}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    });
                    setError("");
                  }}
                  minLength={2}
                  maxLength={100}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email Address
                </label>

                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    });
                    setError("");
                  }}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  User Role
                </label>

                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Delete User
              </h2>

              <button
                onClick={handleCancelDelete}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Trash2 size={22} className="text-red-600" />
              </div>

              <h3 className="text-base font-semibold text-gray-900">
                Are you sure you want to delete this user?
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                You are about to delete{" "}
                <span className="font-semibold text-gray-800">
                  {deletingUser.name}
                </span>
                . This user will be moved to the deleted users list.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 p-5">
              <button
                onClick={handleCancelDelete}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore User Confirmation Modal */}
      {restoringUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Restore User
              </h2>

              <button
                onClick={handleCancelRestore}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <RotateCcw size={22} className="text-green-600" />
              </div>

              <h3 className="text-base font-semibold text-gray-900">
                Restore this user account?
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                <span className="font-semibold text-gray-800">
                  {restoringUser.name}
                </span>{" "}
                will be moved back to the active users list.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 p-5">
              <button
                onClick={handleCancelRestore}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmRestore}
                className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
              >
                Restore User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
