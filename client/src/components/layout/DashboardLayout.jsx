
import { Bell, Search } from "lucide-react";
import Sidebar from "./Sidebar";

function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Top Navbar */}
        <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8">

          {/* Search */}
          <div className="flex w-80 items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
            <Search size={18} className="text-gray-400" />

            <input
              type="text"
              placeholder="Search anything..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-6">

            <button
              type="button"
              className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100"
            >
              <Bell size={21} />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* Profile */}
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                Y
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Welcome User
                </p>

                <p className="text-xs text-gray-500">
                  DevDesk Workspace
                </p>
              </div>

            </div>

          </div>

        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;
