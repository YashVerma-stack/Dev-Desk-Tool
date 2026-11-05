
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

import {
  getProjects,
  getProjectMembers,
  removeProjectMember,
  createProject,
  updateProject,
  deleteProject,
  addProjectMembers,
} from "../../services/projectService";

import {
  Plus,
  FolderKanban,
  Users,
  MoreVertical,
  Search,
  Eye,
  X,
  Pencil,
  Trash2,
  UserMinus,
  UserPlus,
  ArrowUpRight,
  ArrowDownUp,
  Layers3,
  FolderOpen,
  Globe,
  CalendarDays,
  CheckCircle2,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [projectSort, setProjectSort] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [managingProject, setManagingProject] = useState(null);

  // Project members
  const [projectMembers, setProjectMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");
  const [removingMemberId, setRemovingMemberId] = useState(null);

  // Available users
  const [availableUsers, setAvailableUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  // Add members
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [addingMembers, setAddingMembers] = useState(false);

  // Menu state
  const [openMenuId, setOpenMenuId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    memberIds: [],
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setPageError("");

      const response = await getProjects();

      if (!Array.isArray(response.projects)) {
        throw new Error("Unexpected projects response format.");
      }

      setProjects(response.projects);
    } catch (error) {
      console.error("Failed to fetch projects:", error);

      setPageError(
        error.response?.data?.message ||
          error.message ||
          "Unable to fetch projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch active members from Users API
  const fetchAvailableUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError("");

      const response = await api.get("/users");
      const users = response.data.users;

      if (!Array.isArray(users)) {
        throw new Error("Users API did not return a valid users array.");
      }

      const activeMembers = users.filter(
        (user) =>
          user.role?.toLowerCase() === "member" &&
          user.is_deleted === false
      );

      setAvailableUsers(activeMembers);
    } catch (error) {
      console.error("Failed to fetch users:", error);

      setUsersError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load available users."
      );
    } finally {
      setUsersLoading(false);
    }
  };

  // Search and sort projects
  const filteredProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const result = projects.filter((project) => {
      const name = (project.name || "").toLowerCase();
      const description = (
        project.description || ""
      ).toLowerCase();

      return (
        name.includes(normalizedSearch) ||
        description.includes(normalizedSearch)
      );
    });

    return [...result].sort((a, b) => {
      if (projectSort === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }

      if (projectSort === "oldest") {
        return (
          new Date(a.created_at || 0) -
          new Date(b.created_at || 0)
        );
      }

      return (
        new Date(b.updated_at || b.created_at || 0) -
        new Date(a.updated_at || a.created_at || 0)
      );
    });
  }, [projects, search, projectSort]);

  // Open Create Project modal
  const handleOpenCreateModal = async () => {
    setEditingProject(null);

    setFormData({
      name: "",
      description: "",
      memberIds: [],
    });

    setError("");
    setIsModalOpen(true);

    await fetchAvailableUsers();
  };

  // Handle form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // Select members while creating a project
  const handleMemberChange = (memberId) => {
    setFormData((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(memberId)
        ? prev.memberIds.filter((id) => id !== memberId)
        : [...prev.memberIds, memberId],
    }));

    setError("");
  };

  // Create and edit project
  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    const description = formData.description.trim();

    if (name.length < 3 || name.length > 150) {
      setError("Project name must contain 3–150 characters.");
      return;
    }

    if (description.length > 1000) {
      setError("Description cannot exceed 1000 characters.");
      return;
    }

    if (!editingProject && formData.memberIds.length === 0) {
      setError("Please select at least one project member.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      if (editingProject) {
        await updateProject(editingProject.id, {
          name,
          description,
        });
      } else {
        await createProject({
          name,
          description,
          memberIds: formData.memberIds,
        });
      }

      await fetchProjects();
      closeProjectForm();
    } catch (error) {
      console.error("Project submission failed:", error);

      setError(
        error.response?.data?.message ||
          "Unable to save project. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // View project
  const handleViewProject = (project) => {
    setSelectedProject(project);
  };

  // Open Edit Project modal
  const handleEditProject = (project) => {
    setEditingProject(project);

    setFormData({
      name: project.name,
      description: project.description || "",
      memberIds: [],
    });

    setError("");
    setIsModalOpen(true);
  };

  // Delete project
  const handleDeleteProject = async (projectId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      setPageError("");

      await deleteProject(projectId);
      await fetchProjects();

      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }

      if (managingProject?.id === projectId) {
        closeManageMembers();
      }

      setOpenMenuId(null);
    } catch (error) {
      console.error("Failed to delete project:", error);

      setPageError(
        error.response?.data?.message ||
          "Unable to delete project. Please try again."
      );
    }
  };

  // Fetch project members
  const handleManageMembers = async (project) => {
    setManagingProject(project);
    setProjectMembers([]);
    setSelectedMemberIds([]);
    setMembersError("");
    setUsersError("");
    setMembersLoading(true);

    try {
      const response = await getProjectMembers(project.id);

      setProjectMembers(
        Array.isArray(response.members) ? response.members : []
      );
    } catch (error) {
      console.error("Failed to fetch project members:", error);

      setMembersError(
        error.response?.data?.message ||
          "Unable to load project members."
      );
    } finally {
      setMembersLoading(false);
    }

    await fetchAvailableUsers();
  };

  // Remove project member
  const handleRemoveMember = async (member) => {
    if (!managingProject) return;

    const confirmRemove = window.confirm(
      `Remove ${member.name} from this project?`
    );

    if (!confirmRemove) return;

    try {
      setRemovingMemberId(member.id);
      setMembersError("");

      await removeProjectMember(managingProject.id, member.id);

      setProjectMembers((prev) =>
        prev.filter((item) => item.id !== member.id)
      );
    } catch (error) {
      console.error("Failed to remove project member:", error);

      setMembersError(
        error.response?.data?.message ||
          "Unable to remove this member."
      );
    } finally {
      setRemovingMemberId(null);
    }
  };

  // Select members for existing project
  const handleAddMemberSelection = (memberId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Add project members
  const handleAddMembers = async () => {
    if (!managingProject) return;

    if (selectedMemberIds.length === 0) {
      setUsersError("Please select at least one member.");
      return;
    }

    try {
      setAddingMembers(true);
      setUsersError("");

      await addProjectMembers(
        managingProject.id,
        selectedMemberIds
      );

      const membersResponse = await getProjectMembers(
        managingProject.id
      );

      setProjectMembers(
        Array.isArray(membersResponse.members)
          ? membersResponse.members
          : []
      );

      setSelectedMemberIds([]);
    } catch (error) {
      console.error("Failed to add project members:", error);

      setUsersError(
        error.response?.data?.message ||
          "Unable to add project members. Please try again."
      );
    } finally {
      setAddingMembers(false);
    }
  };

  // Retry member loading
  const handleRetryMembers = () => {
    if (managingProject) {
      handleManageMembers(managingProject);
    }
  };

  // Close Create/Edit modal
  const closeProjectForm = () => {
    setIsModalOpen(false);
    setEditingProject(null);

    setFormData({
      name: "",
      description: "",
      memberIds: [],
    });

    setError("");
    setUsersError("");
  };

  // Close Manage Members modal
  const closeManageMembers = () => {
    setManagingProject(null);
    setProjectMembers([]);
    setSelectedMemberIds([]);
    setMembersError("");
    setUsersError("");
    setRemovingMemberId(null);
  };

  // Exclude members already assigned to project
  const unassignedUsers = availableUsers.filter(
    (user) =>
      !projectMembers.some(
        (member) => member.id === user.id
      )
  );

  // Format date
  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Project icon colors
  const projectColors = [
    "bg-orange-100 text-orange-700",
    "bg-blue-100 text-blue-700",
    "bg-violet-100 text-violet-700",
    "bg-emerald-100 text-emerald-700",
    "bg-rose-100 text-rose-700",
  ];

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5 pb-8">

      {/* PAGE HEADER */}
      <section className="rounded-[28px] border border-white bg-white p-5 shadow-[0_12px_40px_rgba(35,31,75,0.045)] sm:p-7">

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-700">
              <FolderKanban size={13} />
              Workspace directory
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Projects
            </h1>

            <p className="mt-1.5 text-sm text-slate-500">
              Manage your workspace projects, technical repositories,
              and team members.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-orange-200 transition hover:bg-orange-700"
          >
            <Plus size={18} />
            Create Project
          </button>
        </div>
      </section>

      {/* ERROR MESSAGE */}
      {pageError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          <span className="flex-1">{pageError}</span>
          <button
            type="button"
            onClick={fetchProjects}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* PROJECT SUMMARY CARDS */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        <div className="relative overflow-hidden rounded-[25px] bg-[#f3f0ff] p-5 sm:p-6">
          <div className="absolute -bottom-10 -right-5 h-28 w-28 rounded-full bg-violet-200/40" />

          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                <FolderOpen size={21} />
              </span>

              <span className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold text-slate-600">
                Workspace
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-950">
              {loading ? "—" : projects.length}
            </p>

            <h2 className="mt-1 text-sm font-semibold text-slate-900">
              Total Projects
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Projects available in your workspace
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[25px] bg-[#eaf0ff] p-5 sm:p-6">
          <div className="absolute -bottom-10 -right-5 h-28 w-28 rounded-full bg-blue-200/40" />

          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <Globe size={21} />
              </span>

              <span className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold text-slate-600">
                Search results
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-950">
              {loading ? "—" : filteredProjects.length}
            </p>

            <h2 className="mt-1 text-sm font-semibold text-slate-900">
              Visible Projects
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Projects matching your current search
            </p>
          </div>
        </div>
      </section>

      {/* PROJECT SEARCH AND FILTERS */}
      <section className="rounded-[22px] border border-white bg-white p-3 shadow-[0_8px_28px_rgba(35,31,75,0.035)]">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 sm:max-w-md">
            <Search size={17} className="shrink-0 text-slate-400" />

            <input
              type="text"
              placeholder="Search projects..."
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

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">
              <ArrowDownUp size={13} className="mr-1 inline" />
              Sort by
            </span>

            <select
              value={projectSort}
              onChange={(e) => setProjectSort(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 outline-none focus:border-orange-400"
            >
              <option value="recent">Recently Updated</option>
              <option value="name">Name A–Z</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </section>

      {/* ALL PROJECTS */}
      <section className="overflow-visible rounded-[26px] border border-white bg-white shadow-[0_8px_28px_rgba(35,31,75,0.035)]">

        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                All Projects
              </h2>

              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-700">
                {filteredProjects.length} Projects
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              View, configure, and manage your projects.
            </p>
          </div>

          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <CalendarDays size={14} />
            Sorted by{" "}
            {projectSort === "recent"
              ? "recently updated"
              : projectSort === "name"
                ? "name"
                : "oldest first"}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500">
            <LoaderCircle size={18} className="animate-spin" />
            Loading projects...
          </div>
        ) : (
          <div className="space-y-2.5 p-4 sm:p-5">

            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className="group flex flex-col justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-orange-100 hover:bg-[#fcfbff] hover:shadow-sm sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 items-start gap-3">

                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      projectColors[index % projectColors.length]
                    }`}
                  >
                    <FolderKanban size={19} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-slate-900">
                        {project.name}
                      </h3>

                      <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-violet-700">
                        Project
                      </span>
                    </div>

                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                      {project.description ||
                        "No description provided"}
                    </p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-slate-400">

                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        Owner: {project.owner_name || "Not available"}
                      </span>

                      <span className="flex items-center gap-1">
                        <CalendarDays size={12} />
                        Created: {formatDate(project.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">

                  <button
                    type="button"
                    onClick={() => handleViewProject(project)}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    <Eye size={14} />
                    View
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === project.id
                            ? null
                            : project.id
                        )
                      }
                      aria-label={`More actions for ${project.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-orange-50 hover:text-orange-700"
                    >
                      <MoreVertical size={17} />
                    </button>

                    {openMenuId === project.id && (
                      <>
                        <button
                          type="button"
                          aria-label="Close project actions"
                          className="fixed inset-0 z-10 cursor-default"
                          onClick={() => setOpenMenuId(null)}
                        />

                        <div className="absolute right-0 top-11 z-20 w-48 rounded-xl border border-slate-100 bg-white py-2 shadow-xl">

                          <button
                            type="button"
                            onClick={() => {
                              handleViewProject(project);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Eye size={15} />
                            View Project
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handleEditProject(project);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil size={15} />
                            Edit Project
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handleManageMembers(project);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Users size={15} />
                            Manage Members
                          </button>

                          <div className="my-1 border-t border-slate-100" />

                          <button
                            type="button"
                            onClick={() => handleDeleteProject(project.id)}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                            Delete Project
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredProjects.length === 0 && (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <FolderOpen size={25} />
                </span>

                <h3 className="mt-4 text-sm font-semibold text-slate-700">
                  {search ? "No matching projects" : "No projects yet"}
                </h3>

                <p className="mt-1 max-w-xs text-xs text-slate-400">
                  {search
                    ? "Try searching with a different project name."
                    : "Create a project to get started with your workspace."}
                </p>

                {!search && (
                  <button
                    type="button"
                    onClick={handleOpenCreateModal}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-orange-700"
                  >
                    <Plus size={15} />
                    Create Project
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* CREATE / EDIT PROJECT MODAL */}
      {(isModalOpen || editingProject) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[25px] bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                  Project workspace
                </span>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {editingProject ? "Edit Project" : "Create Project"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {editingProject
                    ? "Update your project information."
                    : "Add project details and assign team members."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeProjectForm}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Project Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  minLength={3}
                  maxLength={150}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your project..."
                  maxLength={1000}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                />

                <p className="mt-1 text-right text-[11px] text-slate-400">
                  {formData.description.length}/1000
                </p>
              </div>

              {!editingProject && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700">
                      Select Project Members *
                    </label>

                    <span className="text-[11px] text-slate-400">
                      {formData.memberIds.length} selected
                    </span>
                  </div>

                  {usersLoading && (
                    <p className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                      <LoaderCircle size={16} className="animate-spin" />
                      Loading available members...
                    </p>
                  )}

                  {usersError && (
                    <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                      {usersError}

                      <button
                        type="button"
                        onClick={fetchAvailableUsers}
                        className="ml-2 font-semibold underline"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {!usersLoading &&
                    !usersError &&
                    availableUsers.length === 0 && (
                      <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                        No active members are available.
                      </p>
                    )}

                  {!usersLoading && availableUsers.length > 0 && (
                    <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
                      {availableUsers.map((member) => (
                        <label
                          key={member.id}
                          className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition hover:bg-orange-50"
                        >
                          <input
                            type="checkbox"
                            checked={formData.memberIds.includes(member.id)}
                            onChange={() => handleMemberChange(member.id)}
                            className="h-4 w-4 accent-orange-600"
                          />

                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
                            {member.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800">
                              {member.name}
                            </p>

                            <p className="truncate text-xs text-slate-400">
                              {member.email}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeProjectForm}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
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

                  {submitting
                    ? "Saving..."
                    : editingProject
                      ? "Save Changes"
                      : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROJECT DETAILS MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[25px] bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                  Workspace directory
                </span>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Project Details
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">

              <div className="flex items-center gap-3 rounded-2xl bg-orange-50 p-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                  <FolderKanban size={23} />
                </span>

                <div className="min-w-0">
                  <h3 className="break-words text-base font-bold text-slate-900">
                    {selectedProject.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Project ID: {selectedProject.id}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Description
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selectedProject.description ||
                    "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Project Owner</p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedProject.owner_name || "Not available"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Created At</p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatDate(selectedProject.created_at)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">
                    Assigned Members
                  </p>

                  <Users size={17} className="text-orange-600" />
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Open Manage Members to view, add, or remove the actual
                  assigned project members.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    const project = selectedProject;
                    setSelectedProject(null);
                    handleManageMembers(project);
                  }}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-orange-700 hover:text-orange-800"
                >
                  Manage Members
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 p-5 sm:p-6">
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE PROJECT MEMBERS MODAL */}
      {managingProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[25px] bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                  Team management
                </span>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Manage Members
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {managingProject.name}
                </p>
              </div>

              <button
                type="button"
                onClick={closeManageMembers}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-6">

              {/* CURRENT MEMBERS */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Assigned Members
                  </h3>

                  {!membersLoading && !membersError && (
                    <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-700">
                      {projectMembers.length} Members
                    </span>
                  )}
                </div>

                {membersLoading && (
                  <p className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                    <LoaderCircle size={16} className="animate-spin" />
                    Loading project members...
                  </p>
                )}

                {membersError && (
                  <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                    <p>{membersError}</p>

                    <button
                      type="button"
                      onClick={handleRetryMembers}
                      className="mt-2 font-semibold underline"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {!membersLoading &&
                  !membersError &&
                  projectMembers.length === 0 && (
                    <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
                      No members are assigned to this project.
                    </p>
                  )}

                {!membersLoading &&
                  !membersError &&
                  projectMembers.length > 0 && (
                    <div className="space-y-2">
                      {projectMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-700">
                              {member.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {member.name}
                              </p>

                              <p className="truncate text-xs text-slate-400">
                                {member.email}
                              </p>

                              <p className="text-[10px] capitalize text-slate-400">
                                {member.role}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member)}
                            disabled={removingMemberId === member.id}
                            className="inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            {removingMemberId === member.id ? (
                              <LoaderCircle
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <UserMinus size={14} />
                            )}

                            {removingMemberId === member.id
                              ? "Removing..."
                              : "Remove"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              {/* ADD MEMBERS */}
              <div className="border-t border-slate-100 pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Add More Members
                  </h3>

                  <UserPlus size={18} className="text-orange-600" />
                </div>

                {usersLoading && (
                  <p className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                    <LoaderCircle size={16} className="animate-spin" />
                    Loading available users...
                  </p>
                )}

                {usersError && (
                  <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                    {usersError}

                    <button
                      type="button"
                      onClick={fetchAvailableUsers}
                      className="ml-2 font-semibold underline"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!usersLoading &&
                  !usersError &&
                  unassignedUsers.length === 0 && (
                    <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                      No additional active members are available.
                    </p>
                  )}

                {!usersLoading &&
                  unassignedUsers.length > 0 && (
                    <>
                      <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
                        {unassignedUsers.map((user) => (
                          <label
                            key={user.id}
                            className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition hover:bg-orange-50"
                          >
                            <input
                              type="checkbox"
                              checked={selectedMemberIds.includes(user.id)}
                              onChange={() =>
                                handleAddMemberSelection(user.id)
                              }
                              className="h-4 w-4 accent-orange-600"
                            />

                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                              {user.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-800">
                                {user.name}
                              </p>

                              <p className="truncate text-xs text-slate-400">
                                {user.email}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-xs text-slate-500">
                          {selectedMemberIds.length} selected
                        </p>

                        <button
                          type="button"
                          onClick={handleAddMembers}
                          disabled={
                            addingMembers ||
                            selectedMemberIds.length === 0
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {addingMembers ? (
                            <LoaderCircle
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <UserPlus size={15} />
                          )}

                          {addingMembers ? "Adding..." : "Add Members"}
                        </button>
                      </div>
                    </>
                  )}
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeManageMembers}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
