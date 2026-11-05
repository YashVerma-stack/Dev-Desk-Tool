
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Users,
  LogOut,
  Layers,
  Info,
  X,
  ChartNoAxesCombined,
  Bell,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

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
    adminOnly: true,
  },
];

const features = [
  {
    icon: FolderKanban,
    title: "Project Management",
    description: "Create, organize and manage your projects.",
  },
  {
    icon: ClipboardList,
    title: "Issue Tracking",
    description: "Create, assign and track project issues.",
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Manage users and project members.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Dashboard Analytics",
    description: "Monitor project and issue progress.",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Stay updated on important activities.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    description: "Separate Admin and Member permissions.",
  },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loggingOut, setLoggingOut] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const isPreviewMode =
    import.meta.env.DEV &&
    localStorage.getItem("dev-preview-mode") === "true";

  const previewRole = localStorage.getItem("dev-preview-role");

  const currentRole = isPreviewMode
    ? previewRole
    : user?.role;

  const visibleItems = navigationItems.filter(
    (item) => !item.adminOnly || currentRole === "admin"
  );

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      if (!isPreviewMode) {
        await logout();
      }

      localStorage.removeItem("dev-preview-mode");
      localStorage.removeItem("dev-preview-role");
      localStorage.removeItem("user");

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);

      alert(
        error.response?.data?.message ||
          "Unable to logout. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside className="relative m-2 flex h-[calc(100vh-16px)] w-[60px] shrink-0 flex-col items-center rounded-[24px] border border-[#eeeaf5] bg-white py-3 shadow-[0_4px_20px_rgba(40,30,70,0.07)]">

      {/* Logo */}
      <div
        title="DevDesk"
        className="mb-5 flex h-9 w-9 items-center justify-center rounded-xl text-[#8b8799]"
      >
        <Layers size={20} />
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col items-center gap-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              title={item.name}
              aria-label={item.name}
              className={({ isActive }) =>
                `flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-[#242532] !text-white shadow-md"
                    : "text-[#777589] hover:bg-[#f1eff7] hover:text-[#252536]"
                }`
              }
            >
              <Icon
                size={18}
                strokeWidth={2}
                className="text-current"
              />
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="relative flex flex-col items-center gap-2">

        {/* Project Information Button */}
        <button
          type="button"
          title="About DevDesk"
          aria-label="About DevDesk"
          aria-expanded={showInfo}
          onClick={() => setShowInfo((prev) => !prev)}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
            showInfo
              ? "bg-[#242532] text-white"
              : "text-[#9995a8] hover:bg-[#f1eff7] hover:text-[#252536]"
          }`}
        >
          <Info size={18} />
        </button>

        {/* DevDesk Information Card */}
        {showInfo && (
          <div className="absolute bottom-0 left-[50px] z-[100] w-[310px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_15px_50px_rgba(30,30,50,0.18)]">

            {/* Card Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#f05218] to-[#bd3105] px-5 py-5 text-white">

              <button
                type="button"
                onClick={() => setShowInfo(false)}
                aria-label="Close information card"
                className="absolute right-3 top-3 rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
              >
                <X size={17} />
              </button>

              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                <Layers size={25} />
              </div>

              <h2 className="text-xl font-bold">
                About DevDesk
              </h2>

              <p className="mt-1 text-xs leading-relaxed text-white/85">
                Your workspace for smarter project and team management.
              </p>
            </div>

            {/* Card Content */}
            <div className="max-h-[380px] overflow-y-auto px-4 py-4">

              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                What DevDesk provides
              </h3>

              <div className="space-y-4">
                {features.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className="flex items-start gap-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff1e9] text-[#dc4510]">
                        <Icon size={17} />
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-[#242536]">
                          {feature.title}
                        </h4>

                        <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="mt-5 rounded-xl bg-[#f7f5fb] px-3 py-3">
                <div className="flex items-center gap-2">
                  <UserRound size={15} className="text-[#d9430d]" />

                  <p className="text-xs font-semibold text-gray-700">
                    Built for productive teamwork
                  </p>
                </div>

                <p className="mt-1 text-[11px] text-gray-500">
                  DevDesk © 2026. All rights reserved.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* Logout */}
        <button
          type="button"
          title={loggingOut ? "Logging out..." : "Logout"}
          aria-label="Logout"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#9995a8] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        >
          <LogOut size={17} />
        </button>

      </div>
    </aside>
  );
}

export default Sidebar;
