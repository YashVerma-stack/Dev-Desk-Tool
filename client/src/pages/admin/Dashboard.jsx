
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FolderKanban,
  ClipboardList,
  Clock,
  Users,
  ArrowUpRight,
  MoreHorizontal,
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

  useEffect(() => {
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

        setOverview(overviewResponse.overview);
        setIssueStats(issueResponse.issueStats);
        setProjects(projectResponse.projectStats);

      } catch (err) {
        console.error("Dashboard API error:", err);

        setError(
          err.response?.data?.message ||
          "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Convert PostgreSQL COUNT values into numbers
  const getCount = (stats, key) => {
    const item = stats?.find((stat) => stat.status === key);

    return Number(item?.total || 0);
  };

  const openIssues = getCount(
    issueStats?.statusStats,
    "open"
  );

  const stats = [
    {
      title: "Total Projects",
      value: Number(overview?.total_projects || 0),
      icon: FolderKanban,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Issues",
      value: Number(overview?.total_issues || 0),
      icon: ClipboardList,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Open Issues",
      value: openIssues,
      icon: Clock,
      color: "bg-orange-100 text-orange-600",
    },
    ...(user?.role === "admin"
      ? [
          {
            title: "Total Users",
            value: Number(overview?.total_users || 0),
            icon: Users,
            color: "bg-green-100 text-green-600",
          },
        ]
      : []),
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="font-medium text-red-700">
          {error}
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard Overview
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Monitor your projects and issues from one place.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">

                <div className={`rounded-lg p-3 ${stat.color}`}>
                  <Icon size={22} />
                </div>

                <MoreHorizontal
                  className="text-gray-400"
                  size={20}
                />

              </div>

              <h2 className="mt-5 text-3xl font-bold text-gray-900">
                {stat.value}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {stat.title}
              </p>
            </div>
          );
        })}

      </div>

      {/* Recent Projects */}
      <section className="rounded-xl border border-gray-200 bg-white">

        <div className="flex items-center justify-between border-b border-gray-200 p-5">

          <div>
            <h2 className="font-semibold text-gray-900">
              Recent Projects
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Projects and their associated issue counts
            </p>
          </div>

          <button
            onClick={() => navigate("/projects")}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all
            <ArrowUpRight size={16} />
          </button>

        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">

            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Project</th>
                <th className="px-5 py-4">Total Issues</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {projects.length > 0 ? (
                projects.map((project) => (
                  <tr key={project.project_id}>

                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">
                        {project.project_name}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-medium text-gray-700">
                        {Number(project.total_issues || 0)}
                      </span>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="2"
                    className="px-5 py-8 text-center text-gray-500"
                  >
                    No projects found.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

      </section>

      {/* Issue Statistics */}
      <section className="rounded-xl border border-gray-200 bg-white">

        <div className="border-b border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900">
            Issue Statistics
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Breakdown of issues by status and priority
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-2">

          {/* Status Statistics */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-700">
              Issues by Status
            </h3>

            <div className="space-y-4">

              {[
                { key: "open", label: "Open", color: "bg-blue-500" },
                { key: "in_progress", label: "In Progress", color: "bg-orange-500" },
                { key: "resolved", label: "Resolved", color: "bg-green-500" },
                { key: "closed", label: "Closed", color: "bg-gray-500" },
              ].map((item) => {
                const count = getCount(
                  issueStats?.statusStats,
                  item.key
                );

                return (
                  <div key={item.key}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {item.label}
                      </span>

                      <span className="font-semibold text-gray-800">
                        {count}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{
                          width: `${
                            overview?.total_issues
                              ? (count / Number(overview.total_issues)) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* Priority Statistics */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-700">
              Issues by Priority
            </h3>

            <div className="space-y-4">

              {[
                { key: "critical", label: "Critical", color: "text-red-600" },
                { key: "high", label: "High", color: "text-orange-600" },
                { key: "medium", label: "Medium", color: "text-yellow-600" },
                { key: "low", label: "Low", color: "text-green-600" },
              ].map((item) => {
                const priority = issueStats?.priorityStats?.find(
                  (stat) => stat.priority === item.key
                );

                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                  >
                    <span className="text-sm text-gray-600">
                      {item.label}
                    </span>

                    <span className={`text-sm font-bold ${item.color}`}>
                      {Number(priority?.total || 0)}
                    </span>
                  </div>
                );
              })}

            </div>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;
