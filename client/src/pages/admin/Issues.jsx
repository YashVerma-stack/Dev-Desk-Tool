
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  AlertCircle,
  X,
  ClipboardList,
  Clock3,
  CheckCircle2,
  CircleDot,
  Flag,
  FolderKanban,
  User,
  CalendarDays,
  LoaderCircle,
  Filter,
  ArrowUpRight,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";

import {
  getIssues,
  createIssue,
  updateIssue,
  deleteIssue,
} from "../../services/issueService";

import {
  getProjects,
  getProjectMembers,
} from "../../services/projectService";

const emptyForm = {
  title: "",
  description: "",
  priority: "medium",
  projectId: "",
  assignedTo: "",
  status: "open",
};

function Issues() {
  const { user } = useAuth();

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [editingIssue, setEditingIssue] = useState(null);

  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");

  // Fetch issues and projects
  const fetchPageData = useCallback(async () => {
    try {
      setLoading(true);

      const [issueResponse, projectResponse] = await Promise.all([
        getIssues(),
        getProjects(),
      ]);

      setIssues(
        Array.isArray(issueResponse.issues)
          ? issueResponse.issues
          : []
      );

      setProjects(
        Array.isArray(projectResponse.projects)
          ? projectResponse.projects
          : []
      );
    } catch (err) {
      console.error("Failed to fetch issues:", err);

      toast.error(
        err.response?.data?.message ||
          "Unable to load issues."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  // Issue statistics
  const totalIssues = issues.length;

  const openIssues = issues.filter(
    (issue) => issue.status === "open"
  ).length;

  const inProgressIssues = issues.filter(
    (issue) => issue.status === "in_progress"
  ).length;

  const resolvedIssues = issues.filter(
    (issue) => issue.status === "resolved"
  ).length;

  const closedIssues = issues.filter(
    (issue) => issue.status === "closed"
  ).length;

  // Search and filters
  const filteredIssues = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return issues.filter((issue) => {
      const matchesSearch =
        issue.title?.toLowerCase().includes(normalizedSearch) ||
        issue.project_name?.toLowerCase().includes(normalizedSearch) ||
        issue.assignee_name?.toLowerCase().includes(normalizedSearch) ||
        String(issue.id).includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        issue.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        issue.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [issues, search, statusFilter, priorityFilter]);

  // Fetch members belonging to a project
  const fetchMembers = async (projectId) => {
    if (!projectId) {
      setMembers([]);
      return;
    }

    try {
      setMembersLoading(true);

      const response = await getProjectMembers(projectId);

      setMembers(
        Array.isArray(response.members)
          ? response.members.filter(
              (member) =>
                member.role?.toLowerCase() === "member"
            )
          : []
      );
    } catch (err) {
      console.error("Failed to fetch project members:", err);

      setMembers([]);

      setError(
        err.response?.data?.message ||
          "Unable to load project members."
      );
    } finally {
      setMembersLoading(false);
    }
  };

  // Open create modal
  const handleCreateClick = () => {
    setEditingIssue(null);
    setFormData({ ...emptyForm });
    setMembers([]);
    setError("");
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleEditClick = async (issue) => {
    setEditingIssue(issue);

    setFormData({
      title: issue.title || "",
      description: issue.description || "",
      priority: issue.priority || "medium",
      projectId: String(issue.project_id),
      assignedTo: issue.assigned_to
        ? String(issue.assigned_to)
        : "",
      status: issue.status || "open",
    });

    setMembers([]);
    setError("");
    setIsModalOpen(true);

    if (isAdmin) {
      await fetchMembers(issue.project_id);
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // Handle project selection
  const handleProjectChange = async (e) => {
    const projectId = e.target.value;

    setFormData((prev) => ({
      ...prev,
      projectId,
      assignedTo: "",
    }));

    setMembers([]);
    setError("");

    if (isAdmin && projectId) {
      await fetchMembers(projectId);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIssue(null);
    setFormData({ ...emptyForm });
    setMembers([]);
    setError("");
  };

  // Create or update issue
  const handleSubmit = async (e) => {
    e.preventDefault();

    const title = formData.title.trim();
    const description = formData.description.trim();

    if (title.length < 3 || title.length > 200) {
      setError(
        "Title must contain between 3 and 200 characters."
      );
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

    if (isAdmin && formData.assignedTo) {
      const selectedMember = members.find(
        (member) =>
          String(member.id) === formData.assignedTo
      );

      if (!selectedMember) {
        setError("Please select a valid project member.");
        return;
      }
    }

    const payload = {
      title,
      description: description || null,
      priority: formData.priority,
    };

    if (isAdmin) {
      payload.assignedTo = formData.assignedTo
        ? Number(formData.assignedTo)
        : null;
    }

    if (editingIssue) {
      payload.status = formData.status;
    } else {
      payload.projectId = Number(formData.projectId);
    }

    try {
      setSubmitting(true);
      setError("");

      if (editingIssue) {
        await updateIssue(editingIssue.id, payload);
        toast.success("Issue updated successfully.");
      } else {
        await createIssue(payload);
        toast.success("Issue created successfully.");
      }

      await fetchPageData();
      handleCloseModal();
    } catch (err) {
      console.error("Issue submission failed:", err);

      const message =
        err.response?.data?.message ||
        "Unable to save issue. Please try again.";

      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete issue — Admin only
  const handleDelete = async (issueId) => {
    if (!isAdmin) {
      toast.error("Only admins can delete issues.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this issue?"
    );

    if (!confirmed) return;

    try {
      await deleteIssue(issueId);

      toast.success("Issue deleted successfully.");

      if (selectedIssue?.id === issueId) {
        setSelectedIssue(null);
      }

      await fetchPageData();
    } catch (err) {
      console.error("Failed to delete issue:", err);

      toast.error(
        err.response?.data?.message ||
          "Unable to delete issue."
      );
    }
  };

  // Priority styles
  const getPriorityStyle = (priority) => {
    const styles = {
      critical: "bg-red-50 text-red-700 border-red-100",
      high: "bg-orange-50 text-orange-700 border-orange-100",
      medium: "bg-amber-50 text-amber-700 border-amber-100",
      low: "bg-emerald-50 text-emerald-700 border-emerald-100",
    };

    return styles[priority] || styles.low;
  };

  // Priority dot styles
  const getPriorityDot = (priority) => {
    const styles = {
      critical: "bg-red-500",
      high: "bg-orange-500",
      medium: "bg-amber-500",
      low: "bg-emerald-500",
    };

    return styles[priority] || styles.low;
  };

  // Status styles
  const getStatusStyle = (status) => {
    const styles = {
      open: "bg-blue-50 text-blue-700 border-blue-100",
      in_progress: "bg-orange-50 text-orange-700 border-orange-100",
      resolved: "bg-emerald-50 text-emerald-700 border-emerald-100",
      closed: "bg-slate-100 text-slate-600 border-slate-200",
    };

    return styles[status] || styles.open;
  };

  const formatStatus = (status = "") => {
    return status.replace("_", " ");
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Statistics cards
  const statistics = [
    {
      label: "Total Issues",
      value: totalIssues,
      description: "All reported issues",
      icon: ClipboardList,
      iconStyle: "bg-violet-100 text-violet-700",
    },
    {
      label: "Open Issues",
      value: openIssues,
      description: "Waiting for attention",
      icon: CircleDot,
      iconStyle: "bg-blue-100 text-blue-700",
    },
    {
      label: "In Progress",
      value: inProgressIssues,
      description: "Currently being worked on",
      icon: Clock3,
      iconStyle: "bg-orange-100 text-orange-700",
    },
    {
      label: "Resolved",
      value: resolvedIssues,
      description: "Successfully resolved",
      icon: CheckCircle2,
      iconStyle: "bg-emerald-100 text-emerald-700",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5 pb-8">

      {/* PAGE HEADER */}
      <section className="rounded-[28px] border border-white bg-white p-5 shadow-[0_12px_40px_rgba(35,31,75,0.045)] sm:p-7">

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-700">
              <ClipboardList size={13} />
              Issue management
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Issues
            </h1>

            <p className="mt-1.5 text-sm text-slate-500">
              Track, prioritize, and manage issues across your projects.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateClick}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-orange-200 transition hover:bg-orange-700"
          >
            <Plus size={18} />
            Create Issue
          </button>
        </div>

        {/* WORKSPACE BANNER */}
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50/90 to-white px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
            <Flag size={17} />
          </span>

          <div>
            <p className="text-xs font-semibold text-slate-800">
              Keep your work moving
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              Monitor issue priorities and stay updated on project progress.
            </p>
          </div>
        </div>
      </section>

      {/* STATISTICS CARDS */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {statistics.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="rounded-[24px] border border-white bg-white p-5 shadow-[0_8px_28px_rgba(35,31,75,0.035)] transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.iconStyle}`}
                >
                  <Icon size={20} />
                </span>

                <span className="text-[10px] font-medium text-slate-400">
                  Workspace
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
                {stat.value}
              </p>

              <h2 className="mt-1 text-sm font-semibold text-slate-800">
                {stat.label}
              </h2>

              <p className="mt-1 text-[11px] text-slate-400">
                {stat.description}
              </p>
            </article>
          );
        })}
      </section>

      {/* ISSUE FILTERS */}
      <section className="rounded-[22px] border border-white bg-white p-3 shadow-[0_8px_28px_rgba(35,31,75,0.035)]">

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 lg:max-w-sm lg:flex-1">
            <Search size={17} className="shrink-0 text-slate-400" />

            <input
              type="text"
              placeholder="Search issues, projects, assignees..."
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

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

            <div className="flex items-center gap-2">
              <Filter size={15} className="text-slate-400" />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 outline-none focus:border-orange-400 sm:flex-none"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 outline-none focus:border-orange-400"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </section>

      {/* ISSUE LIST */}
      <section className="overflow-visible rounded-[26px] border border-white bg-white shadow-[0_8px_28px_rgba(35,31,75,0.035)]">

        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                All Issues
              </h2>

              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-700">
                {filteredIssues.length} Issues
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              View and manage issues reported across your projects.
            </p>
          </div>

          <span className="text-xs text-slate-400">
            Showing {filteredIssues.length} of {issues.length}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-14 text-sm text-slate-500">
            <LoaderCircle size={18} className="animate-spin" />
            Loading issues...
          </div>
        ) : filteredIssues.length > 0 ? (
          <div className="space-y-2.5 p-4 sm:p-5">

            {filteredIssues.map((issue) => (
              <article
                key={issue.id}
                className="group flex flex-col justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-orange-100 hover:bg-[#fcfbff] hover:shadow-sm lg:flex-row lg:items-center"
              >
                {/* ISSUE INFORMATION */}
                <div className="flex min-w-0 items-start gap-3">

                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
                    <ClipboardList size={19} />
                  </span>

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="break-words text-sm font-semibold text-slate-900">
                        {issue.title}
                      </h3>

                      <span className="text-[10px] font-medium text-slate-400">
                        #{issue.id}
                      </span>
                    </div>

                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                      {issue.description ||
                        "No description provided."}
                    </p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">

                      <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <FolderKanban size={12} className="text-slate-400" />
                        {issue.project_name || "Unknown project"}
                      </span>

                      <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <User size={12} className="text-slate-400" />
                        {issue.assignee_name || "Unassigned"}
                      </span>

                      <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <CalendarDays size={12} />
                        {formatDate(issue.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* BADGES AND ACTIONS */}
                <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end">

                  <div className="flex flex-wrap items-center gap-2">

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${getPriorityStyle(issue.priority)}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${getPriorityDot(issue.priority)}`}
                      />
                      {issue.priority}
                    </span>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${getStatusStyle(issue.status)}`}
                    >
                      {formatStatus(issue.status)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">

                    <button
                      type="button"
                      onClick={() => setSelectedIssue(issue)}
                      title="View issue"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEditClick(issue)}
                      title="Edit issue"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-orange-50 hover:text-orange-700"
                    >
                      <Pencil size={16} />
                    </button>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDelete(issue.id)}
                        title="Delete issue"
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ClipboardList size={26} />
            </span>

            <h3 className="mt-4 text-sm font-semibold text-slate-700">
              {search || statusFilter !== "all" || priorityFilter !== "all"
                ? "No matching issues"
                : "No issues found"}
            </h3>

            <p className="mt-1 max-w-sm text-xs text-slate-400">
              {search || statusFilter !== "all" || priorityFilter !== "all"
                ? "Try changing your search or filters."
                : "Create an issue to start tracking work in your projects."}
            </p>

            {!search &&
              statusFilter === "all" &&
              priorityFilter === "all" && (
                <button
                  type="button"
                  onClick={handleCreateClick}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-orange-700"
                >
                  <Plus size={15} />
                  Create Issue
                </button>
              )}
          </div>
        )}
      </section>

      {/* CREATE / EDIT ISSUE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[25px] bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                  Issue management
                </span>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {editingIssue ? "Edit Issue" : "Create New Issue"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {editingIssue
                    ? "Update the issue information."
                    : "Enter the details to create a new issue."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              {/* TITLE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Issue Title *
                </label>

                <input
                  type="text"
                  name="title"
                  required
                  minLength={3}
                  maxLength={200}
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter issue title"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  rows={4}
                  maxLength={5000}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the issue..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                />

                <p className="mt-1 text-right text-[11px] text-slate-400">
                  {formData.description.length}/5000
                </p>
              </div>

              {/* PROJECT AND PRIORITY */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Project {!editingIssue && "*"}
                  </label>

                  <select
                    name="projectId"
                    required={!editingIssue}
                    disabled={Boolean(editingIssue)}
                    value={formData.projectId}
                    onChange={handleProjectChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400 disabled:bg-slate-100"
                  >
                    <option value="">Select project</option>

                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>

                  {editingIssue && (
                    <p className="mt-1 text-[11px] text-slate-400">
                      Project cannot be changed through your update API.
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              {/* ASSIGNEE — ADMIN ONLY */}
              {isAdmin && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Assign To
                  </label>

                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    disabled={!formData.projectId || membersLoading}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400 disabled:bg-slate-100"
                  >
                    <option value="">
                      {membersLoading
                        ? "Loading members..."
                        : "Unassigned"}
                    </option>

                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Only members assigned to this project are available.
                  </p>
                </div>
              )}

              {/* STATUS — EDIT ONLY */}
              {editingIssue && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              )}

              {/* FOOTER */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || membersLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting && (
                    <LoaderCircle size={16} className="animate-spin" />
                  )}

                  {submitting
                    ? "Saving..."
                    : editingIssue
                      ? "Save Changes"
                      : "Create Issue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ISSUE DETAILS MODAL */}
      {selectedIssue && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[25px] bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                  Issue details
                </span>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Issue #{selectedIssue.id}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedIssue(null)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-6">

              {/* ISSUE TITLE */}
              <div className="rounded-2xl bg-orange-50 p-4">
                <div className="flex items-center gap-2">
                  <ClipboardList size={17} className="text-orange-700" />

                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700">
                    Issue title
                  </span>
                </div>

                <h3 className="mt-2 break-words text-lg font-bold text-slate-900">
                  {selectedIssue.title}
                </h3>
              </div>

              {/* DESCRIPTION */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Description
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {selectedIssue.description ||
                    "No description provided."}
                </p>
              </div>

              {/* PRIORITY AND STATUS */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    Priority
                  </p>

                  <span
                    className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getPriorityStyle(selectedIssue.priority)}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${getPriorityDot(selectedIssue.priority)}`}
                    />
                    {selectedIssue.priority}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(selectedIssue.status)}`}
                  >
                    {formatStatus(selectedIssue.status)}
                  </span>
                </div>
              </div>

              {/* PROJECT */}
              <div className="rounded-xl border border-slate-100 p-4">
                <div className="flex items-center gap-2">
                  <FolderKanban size={16} className="text-orange-600" />

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Project
                  </p>
                </div>

                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {selectedIssue.project_name || "Unknown project"}
                </p>
              </div>

              {/* ASSIGNED AND CREATOR */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    Assigned To
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {selectedIssue.assignee_name || "Unassigned"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    Created By
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {selectedIssue.creator_name || "Unknown"}
                  </p>
                </div>
              </div>

              {/* DATES */}
              <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Created At
                  </p>

                  <p className="mt-2 text-sm text-slate-700">
                    {formatDate(selectedIssue.created_at)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Last Updated
                  </p>

                  <p className="mt-2 text-sm text-slate-700">
                    {formatDate(selectedIssue.updated_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="flex justify-end border-t border-slate-100 p-5 sm:px-6">
              <button
                type="button"
                onClick={() => setSelectedIssue(null)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
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
