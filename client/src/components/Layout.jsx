import { NavLink, Outlet } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `rounded-xl px-4 py-2 text-sm font-medium transition ${
    isActive ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
  }`;

export default function Layout() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Decorative blurred blobs (what makes the glass effect visible) */}
      <div className="pointer-events-none fixed -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/40 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 -right-32 h-96 w-96 rounded-full bg-pink-500/30 blur-3xl" />
      <div className="pointer-events-none fixed left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-500/20 blur-3xl" />

      <header className="sticky top-0 z-40 px-4 pt-4">
        <nav className="glass mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <span className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="h-3 w-3 rounded-full bg-gradient-to-r from-violet-400 to-pink-400" />
            Expense Tracker
          </span>
          <div className="flex gap-1">
            <NavLink to="/" end className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/expenses" className={linkClass}>
              Expenses
            </NavLink>
          </div>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}