import { useEffect, useState } from "react";
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
} from "lucide-react";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
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

  // Fetch actual users from Users API
  const fetchAvailableUsers = async () => {
  try {
    setUsersLoading(true);
    setUsersError("");

    const response = await api.get("/users");

    console.log("Users API Response:", response.data);

    const users = response.data.users;

    if (!Array.isArray(users)) {
      throw new Error("Users API did not return a valid users array.");
    }

    const activeMembers = users.filter(
      (user) =>
        user.role?.toLowerCase() === "member" &&
        user.is_deleted === false
    );

    console.log("Active Members:", activeMembers);

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

  // Search projects
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(search.toLowerCase())
  );

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

  // Handle Create Project member selection
  const handleMemberChange = (memberId) => {
    setFormData((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(memberId)
        ? prev.memberIds.filter((id) => id !== memberId)
        : [...prev.memberIds, memberId],
    }));

    setError("");
  };

  // Create and Edit Project APIs
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
        const response = await updateProject(editingProject.id, {
          name,
          description,
        });

        console.log("Update Project API Response:", response);
      } else {
        const response = await createProject({
          name,
          description,
          memberIds: formData.memberIds,
        });

        console.log("Create Project API Response:", response);
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
  };

  // Delete Project API
  const handleDeleteProject = async (projectId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      setPageError("");

      const response = await deleteProject(projectId);

      console.log("Delete Project API Response:", response);

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

  // Fetch actual project members
  const handleManageMembers = async (project) => {
    setManagingProject(project);
    setProjectMembers([]);
    setSelectedMemberIds([]);
    setMembersError("");
    setUsersError("");
    setMembersLoading(true);

    try {
      const response = await getProjectMembers(project.id);

      console.log("Project Members API Response:", response);

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

    // Load users for the Add Members section
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

  // Select or deselect members for existing project
  const handleAddMemberSelection = (memberId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Add Project Members API
  const handleAddMembers = async () => {
    if (!managingProject) return;

    if (selectedMemberIds.length === 0) {
      setUsersError("Please select at least one member.");
      return;
    }

    try {
      setAddingMembers(true);
      setUsersError("");

      const response = await addProjectMembers(
        managingProject.id,
        selectedMemberIds
      );

      console.log("Add Project Members API Response:", response);

      // Refresh actual assigned members
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

  // Do not offer members already assigned to this project
  const unassignedUsers = availableUsers.filter(
    (user) =>
      !projectMembers.some(
        (member) => member.id === user.id
      )
  );

  return (
    <div className="space-y-8">
      {/* LOADING STATE */}
      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Loading projects...
        </div>
      )}

      {/* API ERROR */}
      {!loading && pageError && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {pageError}
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Projects
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your workspace projects and team members.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Create Project
        </button>
      </div>

      {/* PROJECT SUMMARY */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <SummaryCard
          title="Total Projects"
          value={projects.length}
          icon={<FolderKanban className="text-blue-600" size={22} />}
        />

        <SummaryCard
          title="Visible Projects"
          value={filteredProjects.length}
          icon={<FolderKanban className="text-purple-600" size={22} />}
        />
      </div>

      {/* PROJECT LIST */}
      {!loading && !pageError && (
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col justify-between gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-gray-900">
                All Projects
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                View and manage your projects.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
              <Search size={18} className="text-gray-400" />

              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-sm outline-none sm:w-56"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="flex flex-col justify-between gap-4 p-5 transition hover:bg-gray-50 sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FolderKanban size={23} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {project.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {project.description || "No description provided"}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span>
                        Owner: {project.owner_name || "Not available"}
                      </span>

                      <span className="flex items-center gap-1 text-gray-400">
                        <Users size={14} />
                        Open Manage Members to view assigned members
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleViewProject(project)}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                  >
                    <Eye size={16} />
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
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                    >
                      <MoreVertical size={19} />
                    </button>

                    {openMenuId === project.id && (
                      <div className="absolute right-0 top-10 z-20 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                        <button
                          type="button"
                          onClick={() => {
                            handleEditProject(project);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
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
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Users size={15} />
                          Manage Members
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteProject(project.id)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                          Delete Project
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredProjects.length === 0 && (
              <div className="p-10 text-center text-sm text-gray-500">
                No projects found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT PROJECT MODAL */}
      {(isModalOpen || editingProject) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProject ? "Edit Project" : "Create Project"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingProject
                    ? "Update your project information."
                    : "Add project details and assign team members."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeProjectForm}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your project..."
                  maxLength={1000}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {formData.description.length}/1000
                </p>
              </div>

              {!editingProject && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Select Project Members *
                  </label>

                  {usersLoading && (
                    <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                      Loading available members...
                    </p>
                  )}

                  {usersError && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
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
                      <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                        No active members are available.
                      </p>
                    )}

                  {!usersLoading &&
                    availableUsers.length > 0 && (
                      <div className="max-h-52 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3">
                        {availableUsers.map((member) => (
                          <label
                            key={member.id}
                            className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={formData.memberIds.includes(member.id)}
                              onChange={() => handleMemberChange(member.id)}
                              className="h-4 w-4 accent-blue-600"
                            />

                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {member.name}
                              </p>

                              <p className="text-xs text-gray-500">
                                {member.email}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}

                  <p className="mt-2 text-xs text-gray-500">
                    {formData.memberIds.length} member(s) selected
                  </p>
                </div>
              )}

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={closeProjectForm}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Project Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Project information and assigned members.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <p className="text-xs font-medium uppercase text-gray-400">
                  Project Name
                </p>

                <h3 className="mt-1 text-lg font-semibold text-gray-900">
                  {selectedProject.name}
                </h3>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-gray-400">
                  Description
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {selectedProject.description || "No description provided"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-gray-400">
                  Project Owner
                </p>

                <p className="mt-1 text-sm font-medium text-gray-800">
                  {selectedProject.owner_name || "Not available"}
                </p>
              </div>

              <div>
                <p className="mb-3 text-xs font-medium uppercase text-gray-400">
                  Assigned Members
                </p>

                <p className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
                  Open Manage Members to view the actual assigned members.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 p-6">
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE PROJECT MEMBERS MODAL */}
      {managingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Manage Members
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {managingProject.name}
                </p>
              </div>

              <button
                type="button"
                onClick={closeManageMembers}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* CURRENT MEMBERS */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Assigned Members
                  </h3>

                  {!membersLoading && !membersError && (
                    <span className="text-xs text-gray-500">
                      {projectMembers.length} Members
                    </span>
                  )}
                </div>

                {membersLoading && (
                  <p className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
                    Loading project members...
                  </p>
                )}

                {membersError && (
                  <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
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
                    <p className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
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
                          className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                              {member.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-gray-800">
                                {member.name}
                              </p>

                              <p className="truncate text-xs text-gray-500">
                                {member.email}
                              </p>

                              <p className="text-xs capitalize text-gray-400">
                                {member.role}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member)}
                            disabled={removingMemberId === member.id}
                            title="Remove member"
                            className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-2 text-xs text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <UserMinus size={15} />

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
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Add More Members
                  </h3>

                  <UserPlus size={18} className="text-blue-600" />
                </div>

                {usersLoading && (
                  <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                    Loading available users...
                  </p>
                )}

                {usersError && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
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
                    <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                      No additional active members are available.
                    </p>
                  )}

                {!usersLoading &&
                  unassignedUsers.length > 0 && (
                    <>
                      <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3">
                        {unassignedUsers.map((user) => (
                          <label
                            key={user.id}
                            className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={selectedMemberIds.includes(user.id)}
                              onChange={() =>
                                handleAddMemberSelection(user.id)
                              }
                              className="h-4 w-4 accent-blue-600"
                            />

                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {user.name}
                              </p>

                              <p className="text-xs text-gray-500">
                                {user.email}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {selectedMemberIds.length} selected
                        </p>

                        <button
                          type="button"
                          onClick={handleAddMembers}
                          disabled={
                            addingMembers ||
                            selectedMemberIds.length === 0
                          }
                          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <UserPlus size={16} />

                          {addingMembers ? "Adding..." : "Add Members"}
                        </button>
                      </div>
                    </>
                  )}
              </div>

              <div className="flex justify-end border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={closeManageMembers}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
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

// Reusable summary card
function SummaryCard({ title, value, icon }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        {icon}
      </div>

      <h2 className="mt-4 text-3xl font-bold text-gray-900">
        {value}
      </h2>
    </div>
  );
}

export default Projects;