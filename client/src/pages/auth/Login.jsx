
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Login form data:", formData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Layers size={25} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            DevDesk
          </h1>

        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          <div className="mb-8 text-center">

            <h2 className="text-2xl font-bold text-gray-900">
              Welcome Back!
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Sign in to continue to your workspace.
            </p>

          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">

                <Mail size={19} className="text-gray-400" />

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full text-sm outline-none"
                />

              </div>

            </div>

            {/* Password */}
            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">

                <Lock size={19} className="text-gray-400" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full text-sm outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>

              </div>

            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">

              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-blue-600"
                />
                Remember me
              </label>

              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </button>

            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Sign In
            </button>

          </form>

          {/* Register Link */}
          <p className="mt-7 text-center text-sm text-gray-600">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Create account
            </Link>

          </p>

        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          © 2026 DevDesk. All rights reserved.
        </p>

      </div>

    </div>
  );
}

export default Login;
