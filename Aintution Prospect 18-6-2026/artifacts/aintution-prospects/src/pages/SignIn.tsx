import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import AI_LOGO from "@assets/AI_LOGO_1781758197757.png";
import { apiLogin, apiSignup } from "@/lib/auth";
import { useAuth } from "@/lib/auth";

type Mode = "login" | "signup";

function PasswordInput({
  value,
  onChange,
  placeholder,
  testId,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  testId: string;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete="current-password"
        className="w-full px-4 py-3 pr-12 rounded-2xl bg-white/70 border border-white/80 focus:outline-none focus:ring-2 focus:ring-blue-200 font-medium text-gray-800 placeholder-gray-300 transition-all"
        data-testid={testId}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function SignIn() {
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { refetch } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (mode === "signup" && password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (mode === "signup" && password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await apiLogin(username, password);
      } else {
        await apiSignup(username, password);
      }
      await refetch();
      setLocation("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function switchMode(m: Mode) {
    setMode(m);
    setError("");
    setPassword("");
    setConfirm("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbfb] via-[#f0f4ff] to-[#fce4f5] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="gradient-border p-[2px] rounded-[2rem] shadow-2xl">
          <div className="glass-panel rounded-[1.8rem] p-8 space-y-6">
            {/* Logo */}
            <div className="flex flex-col items-center gap-3 mb-2">
              <img src={AI_LOGO} alt="Aintution" className="w-16 h-16 drop-shadow-xl" />
              <h1 className="text-2xl font-black text-gradient">Aintution Prospects</h1>
            </div>

            {/* Tab switcher */}
            <div className="flex bg-white/50 rounded-2xl p-1 gap-1">
              {(["login", "signup"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    mode === m
                      ? "bg-gradient-to-r from-blue-300 to-purple-300 text-white shadow-md"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  data-testid={`tab-${m}`}
                >
                  {m === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Username / Email / Phone
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. john or you@email.com"
                  required
                  autoFocus
                  autoComplete="username"
                  className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-white/80 focus:outline-none focus:ring-2 focus:ring-blue-200 font-medium text-gray-800 placeholder-gray-300 transition-all"
                  data-testid="input-username"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Password
                </label>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                  testId="input-password"
                  required
                />
              </div>

              <AnimatePresence>
                {mode === "signup" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Confirm Password
                    </label>
                    <PasswordInput
                      value={confirm}
                      onChange={setConfirm}
                      placeholder="Repeat your password"
                      testId="input-confirm"
                      required={mode === "signup"}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="text-sm font-semibold text-red-500 bg-red-50 px-4 py-2.5 rounded-xl"
                    data-testid="text-error"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-300 to-purple-300 hover:from-blue-400 hover:to-purple-400 text-white font-black text-base shadow-lg transition-all disabled:opacity-60"
                data-testid="button-submit"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {mode === "login" ? "Signing in…" : "Creating account…"}
                  </span>
                ) : (
                  mode === "login" ? "Sign In" : "Create Account"
                )}
              </motion.button>
            </form>

            <p className="text-center text-xs text-gray-400">
              {mode === "login" ? "New here?" : "Already have an account?"}{" "}
              <button
                onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                className="text-blue-500 font-bold hover:text-purple-500 transition-colors"
              >
                {mode === "login" ? "Create account" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
