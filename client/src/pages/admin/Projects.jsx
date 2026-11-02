
import { useState } from "react";
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
  UserPlus,
  UserMinus,
} from "lucide-react";

// Temporary sample members
const sampleMembers = [
  { id: 1, name: "Rahul Sharma", email: "rahul@example.com" },
  { id: 2, name: "Priya Singh", email: "priya@example.com" },
  { id: 3, name: "Amit Verma", email: "amit@example.com" },
  { id: 4, name: "Neha Gupta", email: "neha@example.com" },
];

// Temporary sample projects
const initialProjects = [
  {
    id: 1,
    name: "DevDesk Platform",
    description: "Project and issue management application",
    owner_name: "Admin",
    memberIds: [1, 2, 3],
  },
  {
    id: 2,
    name: "E-commerce Backend",
    description: "Backend API for an e-commerce platform",
    owner_name: "Admin",
    memberIds: [2, 4],
  },
  {
    id: 3,
    name: "Portfolio Website",
    description: "Personal portfolio development",
    owner_name: "Admin",
    memberIds: [1, 2, 3, 4],
  },
];

function Projects() {
  const [projects, setProjects] = useState(initialProjects);
  const [search, setSearch] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [managingProject, setManagingProject] = useState(null);

  // Three-dot menu state
  const [openMenuId, setOpenMenuId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    memberIds: [],
  });

  // Member assignment state
  const [newMemberIds, setNewMemberIds] = useState([]);

  const [error, setError] = useState("");

  // Search projects
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(search.toLowerCase())
  );

  // Open create project modal
  const handleOpenCreateModal = () => {
    setEditingProject(null);

    setFormData({
      name: "",
      description: "",
      memberIds: [],
    });

    setError("");
    setIsModalOpen(true);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // Handle member selection during project creation
  const handleMemberChange = (memberId) => {
    setFormData((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(memberId)
        ? prev.memberIds.filter((id) => id !== memberId)
        : [...prev.memberIds, memberId],
    }));

    setError("");
  };

  // Create or update project
  const handleSubmit = (e) => {
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

    if (editingProject) {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === editingProject.id
            ? { ...project, name, description }
            : project
        )
      );
    } else {
      const newProject = {
        id: Date.now(),
        name,
        description,
        owner_name: "Admin",
        memberIds: [...formData.memberIds],
      };

      setProjects((prev) => [newProject, ...prev]);
    }

    setFormData({
      name: "",
      description: "",
      memberIds: [],
    });

    setEditingProject(null);
    setError("");
    setIsModalOpen(false);
  };

  // View project details
  const handleViewProject = (project) => {
    setSelectedProject(project);
  };

  // Open edit project modal
  const handleEditProject = (project) => {
    setEditingProject(project);

    setFormData({
      name: project.name,
      description: project.description || "",
      memberIds: [...project.memberIds],
    });

    setError("");
  };

  // Delete project
  const handleDeleteProject = (projectId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmDelete) return;

    setProjects((prev) =>
      prev.filter((project) => project.id !== projectId)
    );

    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
    }

    setOpenMenuId(null);
  };

  // Open member management modal
  const handleManageMembers = (project) => {
    setManagingProject(project);
    setNewMemberIds([]);
    setError("");
  };

  // Handle additional member selection
  const handleNewMemberChange = (memberId) => {
    setNewMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );

    setError("");
  };

  // Assign additional members
  const handleAssignMembers = () => {
    if (!managingProject) return;

    if (newMemberIds.length === 0) {
      setError("Please select at least one member to assign.");
      return;
    }

    setProjects((prev) =>
      prev.map((project) =>
        project.id === managingProject.id
          ? {
              ...project,
              memberIds: [
                ...project.memberIds,
                ...newMemberIds.filter(
                  (id) => !project.memberIds.includes(id)
                ),
              ],
            }
          : project
      )
    );

    setNewMemberIds([]);
    setError("");
  };

  // Remove an assigned member
  const handleRemoveMember = (memberId) => {
    if (!managingProject) return;

    const currentProject = projects.find(
      (project) => project.id === managingProject.id
    );

    if (!currentProject) return;

    if (currentProject.memberIds.length <= 1) {
      setError(
        "Cannot remove the last active member from a project."
      );
      return;
    }

    const member = sampleMembers.find(
      (item) => item.id === memberId
    );

    const confirmRemove = window.confirm(
      `Remove ${member?.name || "this member"} from this project?`
    );

    if (!confirmRemove) return;

    setProjects((prev) =>
      prev.map((project) =>
        project.id === managingProject.id
          ? {
              ...project,
              memberIds: project.memberIds.filter(
                (id) => id !== memberId
              ),
            }
          : project
      )
    );

    setError("");
  };

  // Close create/edit modal
  const closeProjectForm = () => {
    setIsModalOpen(false);
    setEditingProject(null);

    setFormData({
      name: "",
      description: "",
      memberIds: [],
    });

    setError("");
  };

  // Get latest project data for member management
  const currentManagingProject = managingProject
    ? projects.find(
        (project) => project.id === managingProject.id
      )
    : null;

  // Get members who are not already assigned
  const availableMembers = currentManagingProject
    ? sampleMembers.filter(
        (member) =>
          !currentManagingProject.memberIds.includes(member.id)
      )
    : [];

  return (
    <div className="space-y-8">

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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          title="Total Projects"
          value={projects.length}
          icon={<FolderKanban className="text-blue-600" size={22} />}
        />

        <SummaryCard
          title="Project Members"
          value={projects.reduce(
            (total, project) => total + project.memberIds.length,
            0
          )}
          icon={<Users className="text-green-600" size={22} />}
        />

        <SummaryCard
          title="Visible Projects"
          value={filteredProjects.length}
          icon={<FolderKanban className="text-purple-600" size={22} />}
        />
      </div>

      {/* PROJECT LIST */}
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
                    <span>Owner: {project.owner_name}</span>

                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {project.memberIds.length} Members
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">

                {/* VIEW BUTTON */}
                <button
                  type="button"
                  onClick={() => handleViewProject(project)}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                >
                  <Eye size={16} />
                  View
                </button>

                {/* THREE DOT MENU */}
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

                  <div className="space-y-2 rounded-lg border border-gray-200 p-3">
                    {sampleMembers.map((member) => (
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
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {editingProject ? "Save Changes" : "Create Project"}
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
                  {selectedProject.owner_name}
                </p>
              </div>

              <div>
                <p className="mb-3 text-xs font-medium uppercase text-gray-400">
                  Assigned Members ({selectedProject.memberIds.length})
                </p>

                <div className="space-y-3">
                  {selectedProject.memberIds.map((memberId) => {
                    const member = sampleMembers.find(
                      (item) => item.id === memberId
                    );

                    if (!member) return null;

                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                          {member.name.charAt(0)}
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
      {managingProject && currentManagingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Manage Members
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {currentManagingProject.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setManagingProject(null);
                  setNewMemberIds([]);
                  setError("");
                }}
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
                  <span className="text-xs text-gray-500">
                    {currentManagingProject.memberIds.length} Members
                  </span>
                </div>

                <div className="space-y-2">
                  {currentManagingProject.memberIds.map((memberId) => {
                    const member = sampleMembers.find(
                      (item) => item.id === memberId
                    );

                    if (!member) return null;

                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                            {member.name.charAt(0)}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-800">
                              {member.name}
                            </p>
                            <p className="truncate text-xs text-gray-500">
                              {member.email}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.id)}
                          title="Remove member"
                          className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-2 text-xs text-red-600 hover:bg-red-50"
                        >
                          <UserMinus size={15} />
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AVAILABLE MEMBERS */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                  Add More Members
                </h3>

                {availableMembers.length > 0 ? (
                  <div className="space-y-2 rounded-lg border border-gray-200 p-3">
                    {availableMembers.map((member) => (
                      <label
                        key={member.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={newMemberIds.includes(member.id)}
                          onChange={() =>
                            handleNewMemberChange(member.id)
                          }
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
                ) : (
                  <p className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
                    All available members are already assigned.
                  </p>
                )}

                <p className="mt-2 text-xs text-gray-500">
                  {newMemberIds.length} additional member(s) selected
                </p>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              {/* MODAL ACTIONS */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setManagingProject(null);
                    setNewMemberIds([]);
                    setError("");
                  }}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleAssignMembers}
                  disabled={newMemberIds.length === 0}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <UserPlus size={16} />
                  Assign Members
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
