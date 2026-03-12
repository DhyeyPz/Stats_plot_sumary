import { Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signin } from "../lib/auth-client";
import Cookies from "js-cookie";

export function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveCredentials, setSaveCredentials] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await signin(email, password);

      Cookies.set("auth_token", data.token, {
        expires: 7,
        secure: true,
        sameSite: "lax",
        path: "/",
      });

      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));

      if (saveCredentials) {
        localStorage.setItem("remembered_email", email);
      }

      // Redirect to dashboard using React Router
      navigate("/");
    } catch (err) {
      setError(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#FAFAFA] flex items-center justify-center p-4 overflow-hidden">
      {/* Main Premium Container */}
      <div className="w-full max-w-[850px] bg-white rounded-[24px] border border-gray-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Branding & Context */}
        <div className="w-full md:w-[45%] p-10 bg-[#FBFBFC] flex flex-col items-center gap-4 border-b md:border-b-0 md:border-r border-gray-100">
          <img
            src="/PZLogo.svg"
            alt="Logo"
            className="h-14 w-auto object-contain"
          />
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight leading-tight mb-3">
            Welcome back 👋
          </h1>
          <p className="text-[15px] text-gray-400 font-small">
            Enter your credentials to access your secure dashboard and manage
            your projects.
          </p>
        </div>

        {/* Right Side: The Form */}
        <div className="w-full md:w-[55%] p-10 md:p-12 flex flex-col justify-center bg-white">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-lg animate-in fade-in duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-sm"
                placeholder="name@company.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[13px] font-semibold text-gray-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold px-1"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            <div className="flex items-center py-1">
              <input
                type="checkbox"
                id="save"
                checked={saveCredentials}
                onChange={(e) => setSaveCredentials(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label
                htmlFor="save"
                className="ml-2 text-sm text-gray-500 cursor-pointer select-none font-medium"
              >
                Keep me signed in
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-3 rounded-xl transition-all shadow-md active:scale-[0.99] disabled:opacity-50 mt-2 text-sm"
            >
              {loading ? "Verifying..." : "Sign In to Account"}
            </button>
          </form>

         
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-[#FAFAFA] font-medium text-gray-400">
          Loading Secure Portal...
        </div>
      }
    >
      <SignInPage />
    </Suspense>
  );
}
