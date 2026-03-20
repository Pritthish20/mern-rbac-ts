import { FormEvent, useEffect, useState } from "react";
import { getUsers } from "../api/auth";
import { createTask, deleteTask, getTasks, updateTask } from "../api/tasks";
import { Session, Task, TaskPriority, TaskStatus, UserSummary } from "../types";

type TaskBoardProps = {
  session: Session;
  onLogout: () => void;
};

const emptyForm = {
  title: "",
  description: "",
  status: "todo" as TaskStatus,
  priority: "medium" as TaskPriority,
  dueDate: "",
  owner: ""
};

const inputClassName =
  "w-full rounded-2xl border border-stone-300 bg-white/80 px-4 py-3 text-stone-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-200";

export function TaskBoard({ session, onLogout }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [filters, setFilters] = useState({ status: "", priority: "", search: "" });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadTasks(activeFilters = filters) {
    const params = Object.fromEntries(
      Object.entries(activeFilters).filter(([, value]) => value.trim().length > 0)
    );
    const response = await getTasks(session.token, params);
    setTasks(response.tasks);
  }

  function resetForm() {
    setEditingTaskId(null);
    setForm({
      ...emptyForm,
      owner: session.user.role === "admin" ? "" : session.user.id
    });
  }

  useEffect(() => {
    resetForm();
  }, [session.user.id, session.user.role]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        await loadTasks({ status: "", priority: "", search: "" });

        if (session.user.role === "admin") {
          const response = await getUsers(session.token);
          setUsers(response.users);
        }
      } catch (error) {
        setMessage({
          type: "error",
          text: error instanceof Error ? error.message : "Failed to load dashboard data"
        });
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [session.token, session.user.role]);

  async function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      await loadTasks(filters);
      setMessage(null);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to apply filters"
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleTaskSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      const normalizedDueDate = form.dueDate ? new Date(form.dueDate).toISOString() : "";
      const payload = {
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        dueDate: normalizedDueDate,
        owner: session.user.role === "admin" && form.owner ? form.owner : undefined
      };

      if (editingTaskId) {
        await updateTask(session.token, editingTaskId, payload);
        setMessage({ type: "success", text: "Task updated successfully." });
      } else {
        await createTask(session.token, payload);
        setMessage({ type: "success", text: "Task created successfully." });
      }

      resetForm();
      await loadTasks();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save task"
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(taskId: string) {
    const confirmed = window.confirm("Delete this task?");

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      await deleteTask(session.token, taskId);
      setMessage({ type: "success", text: "Task deleted successfully." });
      await loadTasks();

      if (editingTaskId === taskId) {
        resetForm();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to delete task"
      });
    } finally {
      setLoading(false);
    }
  }

  function startEdit(task: Task) {
    setEditingTaskId(task._id);
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "",
      owner: task.owner._id
    });
  }

  return (
    <section className="relative z-10 mx-auto max-w-6xl">
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
            Protected Dashboard
          </p>
          <h2 className="mb-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            {session.user.name}
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
            Signed in as <strong>{session.user.role}</strong>. Admins can see every task and reassign
            ownership. Users only see their own tasks.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white/70 px-4 py-2.5 text-sm font-medium text-stone-800 transition hover:bg-white"
            href="http://localhost:5000/api-docs"
            target="_blank"
            rel="noreferrer"
          >
            Swagger Docs
          </a>
          <button
            className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white/70 px-4 py-2.5 text-sm font-medium text-stone-800 transition hover:bg-white"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </header>

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

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border border-stone-800/10 bg-white/75 p-5 shadow-[0_24px_60px_rgba(73,50,33,0.12)] backdrop-blur-md sm:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-stone-900">
              {editingTaskId ? "Edit Task" : "Create Task"}
            </h3>
            {editingTaskId ? (
              <button
                className="text-sm font-medium text-orange-700 transition hover:text-orange-800"
                type="button"
                onClick={resetForm}
              >
                Reset
              </button>
            ) : null}
          </div>

          <form className="grid gap-4" onSubmit={handleTaskSubmit}>
            <label className="grid gap-2 text-sm font-medium text-stone-700">
              <span>Title</span>
              <input
                className={inputClassName}
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-stone-700">
              <span>Description</span>
              <textarea
                className={inputClassName}
                rows={4}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-stone-700">
              <span>Status</span>
              <select
                className={inputClassName}
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({ ...current, status: event.target.value as TaskStatus }))
                }
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-stone-700">
              <span>Priority</span>
              <select
                className={inputClassName}
                value={form.priority}
                onChange={(event) =>
                  setForm((current) => ({ ...current, priority: event.target.value as TaskPriority }))
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-stone-700">
              <span>Due date</span>
              <input
                className={inputClassName}
                type="datetime-local"
                value={form.dueDate}
                onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
              />
            </label>

            {session.user.role === "admin" ? (
              <label className="grid gap-2 text-sm font-medium text-stone-700">
                <span>Assign to</span>
                <select
                  className={inputClassName}
                  value={form.owner}
                  onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))}
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <button
              className="mt-2 inline-flex items-center justify-center rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : editingTaskId ? "Update task" : "Create task"}
            </button>
          </form>
        </aside>

        <div className="grid gap-5">
          <section className="rounded-[28px] border border-stone-800/10 bg-white/75 p-5 shadow-[0_24px_60px_rgba(73,50,33,0.12)] backdrop-blur-md sm:p-6">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-stone-900">Filters</h3>
              <span className="text-sm text-stone-500">{tasks.length} visible tasks</span>
            </div>

            <form
              className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
              onSubmit={handleFilterSubmit}
            >
              <input
                className={inputClassName}
                placeholder="Search title or description"
                value={filters.search}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, search: event.target.value }))
                }
              />

              <select
                className={inputClassName}
                value={filters.status}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, status: event.target.value }))
                }
              >
                <option value="">All statuses</option>
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>

              <select
                className={inputClassName}
                value={filters.priority}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, priority: event.target.value }))
                }
              >
                <option value="">All priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <button
                className="inline-flex items-center justify-center rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={loading}
              >
                Apply
              </button>
            </form>
          </section>

          <section className="rounded-[28px] border border-stone-800/10 bg-white/75 p-5 shadow-[0_24px_60px_rgba(73,50,33,0.12)] backdrop-blur-md sm:p-6">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-stone-900">Task List</h3>
              <span className="text-sm text-stone-500">
                {loading ? "Refreshing..." : session.user.role === "admin" ? "All users" : "My tasks"}
              </span>
            </div>

            <div className="grid gap-4">
              {tasks.length === 0 ? (
                <p className="text-sm text-stone-500">No tasks found for the current filters.</p>
              ) : null}

              {tasks.map((task) => (
                <article
                  className="rounded-3xl border border-stone-200 bg-white/80 p-5 shadow-sm"
                  key={task._id}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                            task.status === "todo"
                              ? "bg-amber-100 text-amber-900"
                              : task.status === "in_progress"
                                ? "bg-blue-100 text-blue-900"
                                : "bg-emerald-100 text-emerald-900"
                          }`}
                        >
                          {task.status}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                            task.priority === "low"
                              ? "bg-slate-100 text-slate-900"
                              : task.priority === "medium"
                                ? "bg-yellow-100 text-yellow-900"
                                : "bg-rose-100 text-rose-900"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-stone-900">{task.title}</h4>
                    </div>
                    <div className="flex gap-4">
                      <button
                        className="text-sm font-medium text-orange-700 transition hover:text-orange-800"
                        type="button"
                        onClick={() => startEdit(task)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-sm font-medium text-rose-700 transition hover:text-rose-800"
                        type="button"
                        onClick={() => handleDelete(task._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-stone-600">
                    {task.description || "No description provided."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-500">
                    <span>Owner: {task.owner.name}</span>
                    <span>Created by: {task.createdBy.name}</span>
                    <span>
                      Due: {task.dueDate ? new Date(task.dueDate).toLocaleString() : "No due date"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
