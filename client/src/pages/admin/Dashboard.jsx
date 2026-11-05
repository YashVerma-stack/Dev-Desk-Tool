
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FolderKanban,
  ClipboardList,
  Clock3,
  Users,
  ArrowUpRight,
  Plus,
  Search,
  MoreVertical,
  Flag,
  CircleCheck,
  AlertCircle,
  Activity,
  Layers3,
} from "lucide-react";

import {
  getDashboardOverview,
  getDashboardIssueStats,
  getDashboardProjectStats,
} from "../../services/dashboardService";

import { useAuth } from "../../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [issueStats, setIssueStats] = useState(null);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [projectView, setProjectView] = useState("all");

  // Fetch dashboard data
  useEffect(() => {
    let active = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          overviewResponse,
          issueResponse,
          projectResponse,
        ] = await Promise.all([
          getDashboardOverview(),
          getDashboardIssueStats(),
          getDashboardProjectStats(),
        ]);

        if (!active) return;

        setOverview(overviewResponse.overview);
        setIssueStats(issueResponse.issueStats);
        setProjects(projectResponse.projectStats || []);
      } catch (err) {
        if (!active) return;

        console.error("Dashboard API error:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load dashboard data."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      active = false;
    };
  }, []);

  // Get counts from API statistics
  const getCount = (stats, key, field = "status") => {
    const item = stats?.find(
      (stat) => stat[field] === key
    );

    return Number(item?.total || 0);
  };

  const totalProjects = Number(
    overview?.total_projects || 0
  );

  const totalIssues = Number(
    overview?.total_issues || 0
  );

  const openIssues = getCount(
    issueStats?.statusStats,
    "open"
  );

  const inProgressIssues = getCount(
    issueStats?.statusStats,
    "in_progress"
  );

  const resolvedIssues = getCount(
    issueStats?.statusStats,
    "resolved"
  );

  const closedIssues = getCount(
    issueStats?.statusStats,
    "closed"
  );

  // Dynamic greeting
  const greeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";

    return "Good evening";
  };

  // Filter projects
  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    let result = projects.filter((project) =>
      (project.project_name || "")
        .toLowerCase()
        .includes(normalizedSearch)
    );

    if (projectView === "recent") {
      result = result.slice(0, 5);
    }

    return result;
  }, [projects, searchTerm, projectView]);

  // Statistics cards
  const stats = [
    {
      title: "Total Projects",
      value: totalProjects,
      detail: "Projects in your workspace",
      icon: FolderKanban,
      iconStyle: "bg-blue-100 text-blue-700",
    },
    {
      title: "Total Issues",
      value: totalIssues,
      detail: "Across your projects",
      icon: ClipboardList,
      iconStyle: "bg-orange-100 text-orange-700",
    },
    {
      title: "Open Issues",
      value: openIssues,
      detail: "Waiting for attention",
      icon: Clock3,
      iconStyle: "bg-violet-100 text-violet-700",
    },
    ...(user?.role === "admin"
      ? [
          {
            title: "Total Users",
            value: Number(
              overview?.total_users || 0
            ),
            detail: "Workspace members",
            icon: Users,
            iconStyle:
              "bg-emerald-100 text-emerald-700",
          },
        ]
      : []),
  ];

  // Priority information
  const priorityItems = [
    {
      key: "critical",
      label: "Critical",
      style: "bg-red-50 text-red-700",
      dot: "bg-red-500",
    },
    {
      key: "high",
      label: "High",
      style: "bg-orange-50 text-orange-700",
      dot: "bg-orange-500",
    },
    {
      key: "medium",
      label: "Medium",
      style: "bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
    },
    {
      key: "low",
      label: "Low",
      style: "bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="rounded-2xl border border-slate-100 bg-white px-6 py-5 text-sm text-slate-500 shadow-sm">
          Loading your workspace...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-3xl border border-red-100 bg-white p-7 shadow-sm">
        <div className="flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />

          <p className="font-semibold">
            {error}
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5 pb-6">

      {/* Page Heading */}
      <section className="rounded-[28px] border border-white bg-white px-5 py-6 shadow-[0_12px_40px_rgba(35,31,75,0.045)] sm:px-7 sm:py-7">

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              Productivity workspace
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {greeting()},{" "}
              {user?.name?.trim()?.split(" ")[0] || "there"}
            </h1>

            <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
              Stay on top of your projects, monitor issues,
              and track development progress.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate("/issues")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              View issues
              <ArrowUpRight size={16} />
            </button>

            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/projects")}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
              >
                <Plus size={17} />
                Create project
              </button>
            )}
          </div>
        </div>

        {/* Workspace Banner */}
        <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50/90 to-white px-4 py-3">

          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
            <Activity size={16} />
          </span>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800">
              Your workspace at a glance
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              A live summary of the projects and issues
              available to your account.
            </p>
          </div>
        </div>
      </section>

      {/* Statistics Cards */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.title}
              className="group rounded-[24px] border border-white bg-white p-5 shadow-[0_8px_28px_rgba(35,31,75,0.035)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(35,31,75,0.07)]"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${stat.iconStyle}`}
                >
                  <Icon size={19} />
                </span>

                <MoreVertical
                  size={17}
                  className="text-slate-300"
                />
              </div>

              <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
                {stat.value}
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {stat.title}
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                {stat.detail}
              </p>
            </article>
          );
        })}
      </section>

      {/* Project Controls */}
      <section className="flex flex-col justify-between gap-3 rounded-[22px] border border-white bg-white p-3 shadow-[0_8px_28px_rgba(35,31,75,0.035)] lg:flex-row lg:items-center">

        <div className="inline-flex w-fit items-center rounded-xl bg-slate-100/80 p-1">

          <button
            onClick={() => setProjectView("all")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
              projectView === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            All projects
          </button>

          <button
            onClick={() => setProjectView("recent")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
              projectView === "recent"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Recent
          </button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

          <label className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 sm:w-64">
            <Search
              size={15}
              className="shrink-0 text-slate-400"
            />

            <input
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search projects..."
              className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
            />
          </label>

          {user?.role === "admin" && (
            <button
              onClick={() => navigate("/projects")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-orange-200 transition hover:bg-orange-700"
            >
              <Plus size={15} />
              Create project
            </button>
          )}
        </div>
      </section>

      {/* Projects and Issue Insights */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr_0.9fr]">

        {/* Recent Projects */}
        <div className="overflow-hidden rounded-[26px] border border-white bg-white shadow-[0_8px_28px_rgba(35,31,75,0.035)]">

          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Recent projects
                </h2>

                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                  {projects.length} total
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Projects and their associated issue counts
              </p>
            </div>

            <button
              onClick={() => navigate("/projects")}
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-orange-700 hover:text-orange-800"
            >
              View all
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="space-y-2.5 p-4 sm:p-5">

            {filteredProjects.length > 0 ? (
              filteredProjects.map((project, index) => (
                <button
                  type="button"
                  key={
                    project.project_id ??
                    `${project.project_name}-${index}`
                  }
                  onClick={() => navigate("/projects")}
                  className="group flex w-full items-center justify-between gap-3 rounded-2xl bg-[#f7f6fc] px-3 py-3 text-left transition hover:bg-[#f0eef9] sm:px-4"
                >
                  <div className="flex min-w-0 items-center gap-3">

                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        [
                          "bg-orange-100 text-orange-700",
                          "bg-blue-100 text-blue-700",
                          "bg-violet-100 text-violet-700",
                          "bg-emerald-100 text-emerald-700",
                        ][index % 4]
                      }`}
                    >
                      <FolderKanban size={18} />
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {project.project_name || "Untitled project"}
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Project workspace
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">

                    <span className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600 sm:inline-flex">
                      <Flag size={11} />
                      {Number(project.total_issues || 0)} issues
                    </span>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition group-hover:text-orange-600">
                      <ArrowUpRight size={15} />
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-12 text-center">
                <Layers3
                  size={28}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-semibold text-slate-600">
                  {searchTerm
                    ? "No matching projects"
                    : "No projects yet"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {searchTerm
                    ? "Try another project name."
                    : "Projects assigned to you will appear here."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Issue Insights */}
        <div className="space-y-4">

          {/* Issue Status */}
          <div className="rounded-[26px] border border-white bg-white p-5 shadow-[0_8px_28px_rgba(35,31,75,0.035)] sm:p-6">

            <div className="flex items-start justify-between">

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Issue status
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Current work across your workspace
                </p>
              </div>

              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                <Activity size={17} />
              </span>
            </div>

            <div className="mt-5 space-y-4">

              {[
                {
                  label: "Open",
                  count: openIssues,
                  color: "bg-blue-500",
                  text: "text-blue-700",
                },
                {
                  label: "In progress",
                  count: inProgressIssues,
                  color: "bg-orange-500",
                  text: "text-orange-700",
                },
                {
                  label: "Resolved",
                  count: resolvedIssues,
                  color: "bg-emerald-500",
                  text: "text-emerald-700",
                },
                {
                  label: "Closed",
                  count: closedIssues,
                  color: "bg-slate-400",
                  text: "text-slate-600",
                },
              ].map((item) => (
                <div key={item.label}>

                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">
                      {item.label}
                    </span>

                    <span className={`font-bold ${item.text}`}>
                      {item.count}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all`}
                      style={{
                        width: `${
                          totalIssues
                            ? Math.min(
                                (item.count / totalIssues) * 100,
                                100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate("/issues")}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Open issue tracker
              <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Priority Overview */}
          <div className="rounded-[26px] border border-white bg-white p-5 shadow-[0_8px_28px_rgba(35,31,75,0.035)] sm:p-6">

            <div className="flex items-center justify-between gap-2">

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Priority overview
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Issues that need attention
                </p>
              </div>

              <CircleCheck
                size={18}
                className="text-emerald-600"
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">

              {priorityItems.map((item) => (
                <div
                  key={item.key}
                  className={`rounded-xl px-3 py-3 ${item.style}`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${item.dot}`}
                    />
                    {item.label}
                  </div>

                  <p className="mt-1.5 text-xl font-bold">
                    {getCount(
                      issueStats?.priorityStats,
                      item.key,
                      "priority"
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
