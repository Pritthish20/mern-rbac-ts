import { useEffect, useState } from "react";
import { getCurrentUser } from "./api/auth";
import { AuthPanel } from "./components/AuthPanel";
import { TaskBoard } from "./components/TaskBoard";
import { Session } from "./types";

const SESSION_KEY = "mern-rbac-ts-session";

function readSession(): Session | null {
  const raw = window.localStorage.getItem(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Session;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export default function App() {
  const [session, setSession] = useState<Session | null>(readSession);
  const [checkingSession, setCheckingSession] = useState(Boolean(readSession()));
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    const validateSession = async () => {
      if (!session) {
        setCheckingSession(false);
        return;
      }

      try {
        const response = await getCurrentUser(session.token);
        const freshSession = {
          token: session.token,
          user: response.user
        };

        setSession(freshSession);
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(freshSession));
      } catch (error) {
        window.localStorage.removeItem(SESSION_KEY);
        setSession(null);
        setSessionError(error instanceof Error ? error.message : "Session expired");
      } finally {
        setCheckingSession(false);
      }
    };

    validateSession();
  }, []);

  function handleAuthenticated(nextSession: Session) {
    setSession(nextSession);
    setSessionError("");
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
  }

  function handleLogout() {
    setSession(null);
    window.localStorage.removeItem(SESSION_KEY);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f7f1e5_0%,#efe6d4_45%,#ead8c7_100%)] px-4 py-8 text-stone-900 sm:px-5 sm:py-12">
      <div className="pointer-events-none fixed left-[6%] top-[8%] h-56 w-56 rounded-[40%_60%_54%_46%] bg-orange-200/70 blur-xl" />
      <div className="pointer-events-none fixed bottom-[10%] right-[8%] h-72 w-72 rounded-[57%_43%_41%_59%] bg-orange-700/20 blur-xl" />

      {checkingSession ? (
        <section className="relative z-10 mx-auto max-w-xl rounded-[28px] border border-stone-800/10 bg-white/75 p-6 shadow-[0_24px_60px_rgba(73,50,33,0.12)] backdrop-blur-md sm:p-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
            Session Check
          </p>
          <h1 className="max-w-md text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            Validating your token...
          </h1>
        </section>
      ) : session ? (
        <TaskBoard session={session} onLogout={handleLogout} />
      ) : (
        <>
          {sessionError ? (
            <div className="relative z-10 mx-auto mb-5 max-w-6xl rounded-2xl border border-rose-200 bg-rose-100 px-4 py-3 text-sm font-medium text-rose-800 shadow-sm">
              {sessionError}
            </div>
          ) : null}
          <AuthPanel onAuthenticated={handleAuthenticated} />
        </>
      )}
    </main>
  );
}
