
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Users,
  LogOut,
  Layers,
} from "lucide-react";

const navigationItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Projects",
    path: "/projects",
    icon: FolderKanban,
  },
  {
    name: "Issues",
    path: "/issues",
    icon: ClipboardList,
  },
  {
    name: "Users",
    path: "/users",
    icon: Users,
  },
];

function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col bg-[#111827] text-white">

      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-gray-700 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
          <Layers size={22} />
        </div>

        <h1 className="text-xl font-bold tracking-wide">
          DevDesk
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-6">

        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Workspace
        </p>

        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

      </nav>

      {/* Logout */}
      <div className="border-t border-gray-700 p-4">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>

    </aside>
  );
}

export default Sidebar;
