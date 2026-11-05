
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Layers,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  CircleCheck,
  Bell,
} from "lucide-react";

import { registerUser } from "../../services/authService";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const { name, email, password } = formData;

      const response = await registerUser({
        name,
        email,
        password,
      });

      setSuccess(response.message || "Registration successful!");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f1fb] px-4 py-8">
      <div className="w-full max-w-[420px]">

        {/* Main Register Card */}
        <div className="overflow-hidden rounded-[30px] border border-white bg-gradient-to-br from-white via-white to-[#fff2ec] px-6 py-7 shadow-[0_15px_45px_rgba(45,30,75,0.08)] sm:px-8">

          {/* Branding */}
          <div className="mb-5 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#e94b16] to-[#b82c00] text-white shadow-lg shadow-orange-200">
              <Layers size={23} />
            </div>

            <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#d34413]">
              DevDesk Workspace
            </p>

            <h1 className="mt-1 text-[23px] font-bold tracking-tight text-[#171827]">
              Create Account
            </h1>

            <p className="mt-1 text-xs text-gray-500">
              Get started with your DevDesk workspace.
            </p>
          </div>

          {/* Login / Register Tabs */}
          <div className="mb-5 flex rounded-full bg-[#eeedf5] p-1">
            <Link
              to="/login"
              className="flex-1 rounded-full py-2 text-center text-xs font-medium text-gray-500 transition hover:text-[#c83c0b]"
            >
              Sign In
            </Link>

            <div className="flex-1 rounded-full bg-white py-2 text-center text-xs font-semibold text-[#c83c0b] shadow-sm">
              Create account
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">

            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-[11px] font-medium text-[#333448]"
              >
                Full Name
              </label>

              <div className="flex items-center gap-3 rounded-full border border-transparent bg-[#f3f1fa] px-4 py-2.5 transition focus-within:border-orange-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100">
                <User size={15} className="shrink-0 text-[#8b8ba0]" />

                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  className="w-full bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[11px] font-medium text-[#333448]"
              >
                Email Address
              </label>

              <div className="flex items-center gap-3 rounded-full border border-transparent bg-[#f3f1fa] px-4 py-2.5 transition focus-within:border-orange-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100">
                <Mail size={15} className="shrink-0 text-[#8b8ba0]" />

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="w-full bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[11px] font-medium text-[#333448]"
              >
                Password
              </label>

              <div className="flex items-center gap-3 rounded-full border border-transparent bg-[#f3f1fa] px-4 py-2.5 transition focus-within:border-orange-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100">
                <Lock size={15} className="shrink-0 text-[#8b8ba0]" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className="w-full bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="shrink-0 text-gray-400 transition hover:text-[#c83c0b]"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-[11px] font-medium text-[#333448]"
              >
                Confirm Password
              </label>

              <div className="flex items-center gap-3 rounded-full border border-transparent bg-[#f3f1fa] px-4 py-2.5 transition focus-within:border-orange-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100">
                <Lock size={15} className="shrink-0 text-[#8b8ba0]" />

                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className="w-full bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="shrink-0 text-gray-400 transition hover:text-[#c83c0b]"
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-700">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#e84b15] to-[#b92d00] py-3 text-xs font-bold text-white shadow-[0_5px_12px_rgba(190,54,8,0.18)] transition duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                "Creating Account..."
              ) : (
                <>
                  Create Account
                  <ArrowRight size={15} />
                </>
              )}
            </button>

          </form>

          {/* Workspace Preview */}
          <div className="mt-5 rounded-2xl bg-[#f5f2fb] p-2.5">

            <div className="mb-2 flex items-center justify-between">
              <p className="text-[9px] font-medium uppercase tracking-wide text-gray-500">
                Your Workspace
              </p>

              <div className="flex items-center gap-1 text-[9px] font-medium text-[#c83c0b]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e84b15]" />
                DevDesk Cloud
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">

              {/* Projects */}
              <div className="rounded-lg border border-white bg-white p-2 shadow-sm">
                <div className="mb-2 flex items-center gap-1">
                  <FolderKanban size={9} className="text-orange-600" />
                  <span className="text-[7px] font-semibold text-gray-500">
                    Projects
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="h-1 w-full rounded bg-[#f1e4df]" />
                  <div className="h-1 w-3/4 rounded bg-[#f1e4df]" />
                  <div className="h-1 w-1/2 rounded bg-orange-300" />
                </div>
              </div>

              {/* Tasks */}
              <div className="rounded-lg border border-white bg-white p-2 shadow-sm">
                <div className="mb-2 flex items-center gap-1">
                  <CircleCheck size={9} className="text-blue-600" />
                  <span className="text-[7px] font-semibold text-gray-500">
                    Tasks
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="h-1 w-full rounded bg-blue-100" />
                  <div className="h-1 w-2/3 rounded bg-blue-200" />
                  <div className="h-1 w-4/5 rounded bg-blue-100" />
                </div>
              </div>

              {/* Notifications */}
              <div className="rounded-lg border border-white bg-white p-2 shadow-sm">
                <div className="mb-2 flex items-center gap-1">
                  <Bell size={9} className="text-indigo-600" />
                  <span className="text-[7px] font-semibold text-gray-500">
                    Updates
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="h-1 w-full rounded bg-indigo-100" />
                  <div className="h-1 w-3/4 rounded bg-indigo-200" />
                  <div className="h-1 w-1/2 rounded bg-indigo-100" />
                </div>
              </div>

            </div>
          </div>

          {/* Login Link */}
          <p className="mt-4 text-center text-[11px] text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#c83c0b] hover:underline"
            >
              Sign In
            </Link>
          </p>

          {/* Footer */}
          <div className="mt-5 flex items-center justify-center gap-1 text-[9px] text-gray-400">
            <CheckCircle2 size={10} />
            © 2026 DevDesk. All rights reserved.
          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;
