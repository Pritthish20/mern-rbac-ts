import { FormEvent, useState } from "react";
import { login, register } from "../api/auth";
import { AuthResponse } from "../types";

type AuthPanelProps = {
  onAuthenticated: (session: AuthResponse) => void;
};

export function AuthPanel({ onAuthenticated }: AuthPanelProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [adminInviteCode, setAdminInviteCode] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const session =
        mode === "login"
          ? await login({ email, password })
          : await register({ name, email, password, role, adminInviteCode });

      onAuthenticated(session);
      setMessage({
        type: "success",
        text: mode === "login" ? "Logged in successfully." : "Account created successfully."
      });
      setName("");
      setEmail("");
      setPassword("");
      setAdminInviteCode("");
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Authentication failed"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative z-10 mx-auto max-w-6xl">
      <div className="mb-7 max-w-2xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
          Scalable MERN Starter
        </p>
        <h1 className="mb-4 max-w-xl text-4xl font-semibold leading-none tracking-tight text-stone-900 sm:text-6xl">
          Authentication and task management in one clean stack
        </h1>
        <p className="max-w-2xl text-base leading-7 text-stone-600">
          Register a user, login with JWT, and test role-aware CRUD flows from the same interface.
        </p>
      </div>

      <div className="max-w-md rounded-[28px] border border-stone-800/10 bg-white/75 p-6 shadow-[0_24px_60px_rgba(73,50,33,0.12)] backdrop-blur-md sm:p-7">
        <div
          className="mb-5 grid w-full grid-cols-2 gap-2 rounded-full bg-stone-100/80 p-1"
          role="tablist"
          aria-label="Authentication mode"
        >
          <button
            type="button"
            className={`rounded-full px-4 py-3 text-sm font-medium transition ${
              mode === "login" ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-white/70"
            }`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-3 text-sm font-medium transition ${
              mode === "register" ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-white/70"
            }`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        {message ? (
          <div
            className={`mb-5 rounded-2xl px-4 py-3 text-sm font-medium ${
              message.type === "success"
                ? "border border-emerald-200 bg-emerald-100 text-emerald-800"
                : "border border-rose-200 bg-rose-100 text-rose-800"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <form className="grid gap-4" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <label className="grid gap-2 text-sm font-medium text-stone-700">
              <span>Full name</span>
              <input
                className="rounded-2xl border border-stone-300 bg-white/80 px-4 py-3 text-stone-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-200"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
          ) : null}

          <label className="grid gap-2 text-sm font-medium text-stone-700">
            <span>Email</span>
            <input
              className="rounded-2xl border border-stone-300 bg-white/80 px-4 py-3 text-stone-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-200"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-stone-700">
            <span>Password</span>
            <input
              className="rounded-2xl border border-stone-300 bg-white/80 px-4 py-3 text-stone-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-200"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
          </label>

          {mode === "register" ? (
            <>
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                <span>Role</span>
                <select
                  className="rounded-2xl border border-stone-300 bg-white/80 px-4 py-3 text-stone-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-200"
                  value={role}
                  onChange={(event) => setRole(event.target.value as "user" | "admin")}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>

              {role === "admin" ? (
                <label className="grid gap-2 text-sm font-medium text-stone-700">
                  <span>Admin invite code</span>
                  <input
                    className="rounded-2xl border border-stone-300 bg-white/80 px-4 py-3 text-stone-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-200"
                    value={adminInviteCode}
                    onChange={(event) => setAdminInviteCode(event.target.value)}
                    required
                  />
                </label>
              ) : null}
            </>
          ) : null}

          <button
            className="mt-2 inline-flex items-center justify-center rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={loading}
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
      </div>
    </section>
  );
}
