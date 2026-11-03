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
import Users from "./pages/admin/Users";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />

        <Route
          path="/projects"
          element={
            <DashboardLayout>
              <Projects />
            </DashboardLayout>
          }
        />

        <Route
          path="/issues"
          element={
            <DashboardLayout>
              <Issues />
            </DashboardLayout>
          }
        />

        <Route
          path="/users"
          element={
            <DashboardLayout>
              <Users />
            </DashboardLayout>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;