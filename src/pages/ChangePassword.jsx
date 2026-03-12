import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match");
    }

    if (newPassword.length < 8) {
      return setError("Password must be at least 8 characters long");
    }

    setLoading(true);

    try {
      // Get the logged-in user's ID from local storage
      const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
      const token = localStorage.getItem("auth_token");

      const response = await fetch(
        `${import.meta.env.VITE_AUTH_SERVER_URL}/api/users`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Assuming you use Bearer tokens
          },
          body: JSON.stringify({
            userId: user.id || user._id,
            newPassword: newPassword,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update password");
      }

      if (response.ok) {
        const storedUser = JSON.parse(
          localStorage.getItem("auth_user") || "{}",
        );

        const updatedUser = { ...storedUser, isFirstLogin: false };

        localStorage.setItem("auth_user", JSON.stringify(updatedUser));

        window.location.href = "/";
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F3F4F6] flex items-center justify-center p-6 antialiased">
      <div className="w-full max-w-[480px] bg-white border border-slate-200/60 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-10 pt-10 pb-4 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-900 rounded-[22px] flex items-center justify-center shadow-xl shadow-slate-200 ring-4 ring-slate-50 mb-6">
            <ShieldCheck className="text-white" size={32} strokeWidth={2} />
          </div>
          <h2 className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight">
            Secure Your Account
          </h2>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-[280px]">
            Since this is your first login, please set a permanent, secure
            password.
          </p>
        </div>

        {error && (
          <div className="mx-10 mt-2 p-3 bg-red-50 border border-red-100 text-red-600 text-[13px] font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-10 space-y-5 pt-6">
          <div className="group space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">
              New Password
            </label>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-3.5 pl-5 pr-12 text-slate-900 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="group space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">
              Confirm Password
            </label>
            <input
              required
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-3.5 pl-5 pr-5 text-slate-900 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white transition-all duration-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-slate-200 active:scale-[0.98] mt-4"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={22} />
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
