
import {
  FolderKanban,
  ClipboardList,
  Clock,
  CheckCircle,
  ArrowUpRight,
  MoreHorizontal,
} from "lucide-react";

const stats = [
  {
    title: "Total Projects",
    value: "24",
    icon: FolderKanban,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Total Issues",
    value: "86",
    icon: ClipboardList,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "Open Issues",
    value: "18",
    icon: Clock,
    color: "bg-orange-100 text-orange-600",
  },
  {
    title: "Completed Projects",
    value: "12",
    icon: CheckCircle,
    color: "bg-green-100 text-green-600",
  },
];

const projects = [
  {
    name: "DevDesk Platform",
    description: "Project management system",
    status: "Active",
    progress: 75,
  },
  {
    name: "E-commerce API",
    description: "Online shopping platform",
    status: "Active",
    progress: 60,
  },
  {
    name: "Portfolio Website",
    description: "Personal portfolio project",
    status: "Completed",
    progress: 100,
  },
];

const issues = [
  {
    title: "Fix login validation",
    project: "DevDesk Platform",
    priority: "High",
    status: "In Progress",
  },
  {
    title: "Update dashboard UI",
    project: "DevDesk Platform",
    priority: "Medium",
    status: "Open",
  },
  {
    title: "Resolve API error",
    project: "E-commerce API",
    priority: "Low",
    status: "Closed",
  },
];

function Dashboard() {
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

                <MoreHorizontal className="text-gray-400" size={20} />

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
              Overview of recently managed projects
            </p>
          </div>

          <button className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
            View all
            <ArrowUpRight size={16} />
          </button>

        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">

            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Project</th>
                <th className="px-5 py-4">Progress</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {projects.map((project) => (
                <tr key={project.name}>

                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800">
                      {project.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {project.description}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">

                      <div className="h-2 w-28 rounded-full bg-gray-100">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>

                      <span className="text-xs text-gray-600">
                        {project.progress}%
                      </span>

                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      project.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {project.status}
                    </span>
                  </td>

                </tr>
              ))}

            </tbody>
          </table>
        </div>

      </section>

      {/* Recent Issues */}
      <section className="rounded-xl border border-gray-200 bg-white">

        <div className="border-b border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900">
            Recent Issues
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Latest issues across your projects
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">

            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Issue</th>
                <th className="px-5 py-4">Project</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {issues.map((issue) => (
                <tr key={issue.title}>

                  <td className="px-5 py-4 font-medium text-gray-800">
                    {issue.title}
                  </td>

                  <td className="px-5 py-4 text-gray-500">
                    {issue.project}
                  </td>

                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      issue.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : issue.priority === "Medium"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {issue.priority}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-gray-600">
                    {issue.status}
                  </td>

                </tr>
              ))}

            </tbody>
          </table>
        </div>

      </section>

    </div>
  );
}

export default Dashboard;
