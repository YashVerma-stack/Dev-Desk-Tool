
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Authentication pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Admin pages
import Dashboard from "./pages/admin/Dashboard";
import Projects from "./pages/admin/Projects";
import Issues from "./pages/admin/Issues";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />

        {/* Projects */}
        <Route
          path="/projects"
          element={
            <DashboardLayout>
              <Projects />
            </DashboardLayout>
          }
        />

        {/* Issues */}
        <Route
          path="/issues"
          element={
            <DashboardLayout>
              <Issues />
            </DashboardLayout>
          }
        />

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
