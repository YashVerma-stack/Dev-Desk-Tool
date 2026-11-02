
import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  AlertCircle,
  X,
} from "lucide-react";

// Temporary sample projects
const sampleProjects = [
  { id: 1, name: "DevDesk Platform" },
  { id: 2, name: "E-commerce Backend" },
  { id: 3, name: "Portfolio Website" },
];

// Temporary sample members
const sampleMembers = [
  { id: 1, name: "Rahul Sharma" },
  { id: 2, name: "Priya Singh" },
  { id: 3, name: "Amit Verma" },
  { id: 4, name: "Neha Gupta" },
];

// Temporary sample issues
const initialIssues = [
  {
    id: 1,
    title: "Login API returns 500 error",
    description: "The login endpoint returns an internal server error.",
    priority: "critical",
    status: "in_progress",
    project_id: 1,
    project_name: "DevDesk Platform",
    assigned_to: 1,
    assignee_name: "Rahul Sharma",
    created_by: 10,
    creator_name: "Admin",
    created_at: "2026-10-30T10:30:00",
    updated_at: "2026-11-01T12:00:00",
  },
  {
    id: 2,
    title: "Fix project member validation",
    description: "Validate member assignments before saving.",
    priority: "high",
    status: "open",
    project_id: 2,
    project_name: "E-commerce Backend",
    assigned_to: 2,
    assignee_name: "Priya Singh",
    created_by: 10,
    creator_name: "Admin",
    created_at: "2026-10-31T09:00:00",
    updated_at: "2026-10-31T09:00:00",
  },
  {
    id: 3,
    title: "Update portfolio layout",
    description: "Improve the responsive layout of the portfolio.",
    priority: "medium",
    status: "resolved",
    project_id: 3,
    project_name: "Portfolio Website",
    assigned_to: 3,
    assignee_name: "Amit Verma",
    created_by: 10,
    creator_name: "Admin",
    created_at: "2026-10-29T14:00:00",
    updated_at: "2026-11-01T11:00:00",
  },
  {
    id: 4,
    title: "Improve API response handling",
    description: "Handle unexpected API responses properly.",
    priority: "low",
    status: "closed",
    project_id: 1,
    project_name: "DevDesk Platform",
    assigned_to: null,
    assignee_name: null,
    created_by: 10,
    creator_name: "Admin",
    created_at: "2026-10-28T12:00:00",
    updated_at: "2026-10-30T15:00:00",
  },
];

const emptyForm = {
  title: "",
  description: "",
  priority: "medium",
  projectId: "",
  assignedTo: "",
  status: "open",
};

function Issues() {
  const [issues, setIssues] = useState(initialIssues);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [editingIssue, setEditingIssue] = useState(null);

  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");

  // Search issues by title
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) =>
      issue.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [issues, search]);

  // Create issue modal
  const handleCreateClick = () => {
    setEditingIssue(null);
    setFormData({ ...emptyForm });
    setError("");
    setIsModalOpen(true);
  };

  // Edit issue modal
  const handleEditClick = (issue) => {
    setEditingIssue(issue);

    setFormData({
      title: issue.title,
      description: issue.description || "",
      priority: issue.priority,
      projectId: String(issue.project_id),
      assignedTo: issue.assigned_to
        ? String(issue.assigned_to)
        : "",
      status: issue.status,
    });

    setError("");
    setIsModalOpen(true);
  };

  // Close create/edit modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIssue(null);
    setFormData({ ...emptyForm });
    setError("");
  };

  // Create or update issue
  const handleSubmit = (e) => {
    e.preventDefault();

    const title = formData.title.trim();
    const description = formData.description.trim();

    if (title.length < 3 || title.length > 200) {
      setError("Title must contain between 3 and 200 characters.");
      return;
    }

    if (description.length > 5000) {
      setError("Description must not exceed 5000 characters.");
      return;
    }

    if (!editingIssue && !formData.projectId) {
      setError("Please select a project.");
      return;
    }

    const project = sampleProjects.find(
      (item) => item.id === Number(formData.projectId)
    );

    if (!editingIssue && !project) {
      setError("Please select a valid project.");
      return;
    }

    const member = sampleMembers.find(
      (item) => item.id === Number(formData.assignedTo)
    );

    const now = new Date().toISOString();

    if (editingIssue) {
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === editingIssue.id
            ? {
                ...issue,
                title,
                description: description || null,
                priority: formData.priority,
                status: formData.status,
                assigned_to: formData.assignedTo
                  ? Number(formData.assignedTo)
                  : null,
                assignee_name: member?.name || null,
                updated_at: now,
              }
            : issue
        )
      );

      // Keep the details modal synchronized if it is showing this issue
      setSelectedIssue((prev) =>
        prev?.id === editingIssue.id
          ? {
              ...prev,
              title,
              description: description || null,
              priority: formData.priority,
              status: formData.status,
              assigned_to: formData.assignedTo
                ? Number(formData.assignedTo)
                : null,
              assignee_name: member?.name || null,
              updated_at: now,
            }
          : prev
      );
    } else {
      const newIssue = {
        id: Date.now(),
        title,
        description: description || null,
        priority: formData.priority,
        status: "open",
        project_id: Number(formData.projectId),
        project_name: project.name,
        assigned_to: formData.assignedTo
          ? Number(formData.assignedTo)
          : null,
        assignee_name: member?.name || null,
        created_by: 10,
        creator_name: "Admin",
        created_at: now,
        updated_at: now,
      };

      setIssues((prev) => [newIssue, ...prev]);
    }

    handleCloseModal();
  };

  // Delete issue
  const handleDelete = (issueId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this issue?"
    );

    if (!confirmed) return;

    setIssues((prev) =>
      prev.filter((issue) => issue.id !== issueId)
    );

    if (selectedIssue?.id === issueId) {
      setSelectedIssue(null);
    }
  };

  // Priority badge styles
  const getPriorityStyle = (priority) => {
    const styles = {
      critical: "bg-red-100 text-red-700",
      high: "bg-orange-100 text-orange-700",
      medium: "bg-yellow-100 text-yellow-700",
      low: "bg-gray-100 text-gray-700",
    };

    return styles[priority] || styles.low;
  };

  // Status badge styles
  const getStatusStyle = (status) => {
    const styles = {
      open: "bg-blue-100 text-blue-700",
      in_progress: "bg-orange-100 text-orange-700",
      resolved: "bg-green-100 text-green-700",
      closed: "bg-gray-100 text-gray-700",
    };

    return styles[status] || styles.open;
  };

  const formatStatus = (status) => {
    return status.replace("_", " ");
  };

  // Format dates
  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Issues
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create, track, and manage project issues.
          </p>
        </div>

        <button
          onClick={handleCreateClick}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Create Issue
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Issues</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {issues.length}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Open</p>
          <h2 className="mt-2 text-2xl font-bold text-blue-600">
            {issues.filter((issue) => issue.status === "open").length}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">In Progress</p>
          <h2 className="mt-2 text-2xl font-bold text-orange-500">
            {issues.filter((issue) => issue.status === "in_progress").length}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Resolved</p>
          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {issues.filter((issue) => issue.status === "resolved").length}
          </h2>
        </div>

      </div>

      {/* Search */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search issues by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Issues Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            All Issues
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {filteredIssues.length} issues found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">

            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4 font-medium">Issue</th>
                <th className="px-5 py-4 font-medium">Project</th>
                <th className="px-5 py-4 font-medium">Priority</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Assigned To</th>
                <th className="px-5 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {filteredIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-gray-50">

                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">
                      {issue.title}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      #{issue.id} · By {issue.creator_name}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {issue.project_name}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getPriorityStyle(issue.priority)}`}
                    >
                      {issue.priority}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusStyle(issue.status)}`}
                    >
                      {formatStatus(issue.status)}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {issue.assignee_name || "Unassigned"}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">

                      {/* View */}
                      <button
                        onClick={() => setSelectedIssue(issue)}
                        title="View issue"
                        className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye size={17} />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleEditClick(issue)}
                        title="Edit issue"
                        className="rounded-lg p-2 text-gray-500 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <Pencil size={17} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(issue.id)}
                        title="Delete issue"
                        className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}

              {filteredIssues.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    <AlertCircle
                      className="mx-auto mb-2 text-gray-400"
                      size={24}
                    />
                    No issues found.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Issue Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingIssue ? "Edit Issue" : "Create New Issue"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingIssue
                    ? "Update the issue information."
                    : "Enter the details to create a new issue."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-5 p-6">

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Issue Title *
                </label>

                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={200}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter issue title"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  rows={4}
                  maxLength={5000}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the issue..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {formData.description.length}/5000
                </p>
              </div>

              {/* Project and Priority */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Project {!editingIssue && "*"}
                  </label>

                  <select
                    required={!editingIssue}
                    disabled={Boolean(editingIssue)}
                    value={formData.projectId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        projectId: e.target.value,
                        assignedTo: "",
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select project</option>

                    {sampleProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>

                  {editingIssue && (
                    <p className="mt-1 text-xs text-gray-400">
                      Project cannot be changed through your update API.
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Priority
                  </label>

                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

              </div>

              {/* Assignee */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Assign To
                </label>

                <select
                  value={formData.assignedTo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      assignedTo: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Unassigned</option>

                  {sampleMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status — Edit Only */}
              {editingIssue && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Status
                  </label>

                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {editingIssue ? "Save Changes" : "Create Issue"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Issue Details Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Issue Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Issue #{selectedIssue.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedIssue(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Issue Information */}
            <div className="space-y-6 p-6">

              {/* Title */}
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Issue Title
                </p>

                <h3 className="mt-2 text-lg font-semibold text-gray-900">
                  {selectedIssue.title}
                </h3>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Description
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {selectedIssue.description || "No description provided."}
                </p>
              </div>

              {/* Priority and Status */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Priority
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getPriorityStyle(selectedIssue.priority)}`}
                  >
                    {selectedIssue.priority}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(selectedIssue.status)}`}
                  >
                    {formatStatus(selectedIssue.status)}
                  </span>
                </div>

              </div>

              {/* Project */}
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Project
                </p>

                <p className="mt-2 text-sm font-medium text-gray-900">
                  {selectedIssue.project_name}
                </p>
              </div>

              {/* Assignment */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Assigned To
                  </p>

                  <p className="mt-2 text-sm text-gray-900">
                    {selectedIssue.assignee_name || "Unassigned"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Created By
                  </p>

                  <p className="mt-2 text-sm text-gray-900">
                    {selectedIssue.creator_name}
                  </p>
                </div>

              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 gap-5 border-t border-gray-200 pt-5 sm:grid-cols-2">

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Created At
                  </p>

                  <p className="mt-2 text-sm text-gray-700">
                    {formatDate(selectedIssue.created_at)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Last Updated
                  </p>

                  <p className="mt-2 text-sm text-gray-700">
                    {formatDate(selectedIssue.updated_at)}
                  </p>
                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-gray-200 px-6 py-4">

              <button
                onClick={() => setSelectedIssue(null)}
                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                Close
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Issues;
