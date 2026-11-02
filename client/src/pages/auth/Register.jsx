
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Static UI for now
    const { name, email, password } = formData;

    console.log({
      name,
      email,
      password,
    });
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

        {/* Register Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          <div className="mb-7 text-center">

            <h2 className="text-2xl font-bold text-gray-900">
              Create Account
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Get started with your DevDesk workspace.
            </p>

          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>

              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">

                <User size={19} className="text-gray-400" />

                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full text-sm outline-none"
                />

              </div>

            </div>

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
                  placeholder="Create a password"
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

            {/* Confirm Password */}
            <div>

              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">

                <Lock size={19} className="text-gray-400" />

                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full text-sm outline-none"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="text-gray-400 hover:text-gray-700"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>

              </div>

            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            {/* Register Button */}
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Create Account
            </button>

          </form>

          {/* Login Link */}
          <p className="mt-7 text-center text-sm text-gray-600">

            Already have an account?{" "}

            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Sign In
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

export default Register;
