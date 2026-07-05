import {
  Banknote,
  BarChart3,
  Bell,
  ChevronRight,
  ClipboardList,
  FileText,
  Gauge,
  History,
  Import,
  Landmark,
  LogOut,
  Menu,
  Moon,
  PiggyBank,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Target,
  Users,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../helpers/api-client";

type Notification = {
  id: string;
  title: string;
  desc: string;
  read: boolean;
  time: string;
};

type SearchResult = {
  type: string;
  title: string;
  href: string;
};

const userNavGroups = [
  {
    title: "Overview",
    items: [{ label: "Overview", href: "/dashboard", icon: Gauge }],
  },
  {
    title: "Money Management",
    items: [
      { label: "Transactions", href: "/dashboard/transactions", icon: ClipboardList },
      { label: "Accounts", href: "/dashboard/accounts", icon: Banknote },
      { label: "Budgets", href: "/dashboard/budgets", icon: PiggyBank },
      { label: "Savings Goals", href: "/dashboard/savings-goals", icon: Target },
    ],
  },
  {
    title: "Reports",
    items: [{ label: "Reports", href: "/dashboard/reports", icon: FileText }],
  },
  {
    title: "Assets & Net Worth",
    items: [
      { label: "Portfolio", href: "/dashboard/assets/portfolio", icon: BarChart3 },
      { label: "Instruments", href: "/dashboard/assets/instruments", icon: Landmark },
      { label: "Import Data", href: "/dashboard/imports", icon: Import },
    ],
  },
];

const adminNavGroups = [
  {
    title: "Admin",
    items: [
      { label: "Admin Dashboard", href: "/dashboard/admin", icon: ShieldCheck },
      { label: "Users", href: "/dashboard/admin/users", icon: Users },
      { label: "Audit Log", href: "/dashboard/admin/audit-log", icon: History },
    ],
  },
];

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Notifications Data Fetching
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await apiClient.get<Notification[]>("/api/v1/notifications");
      return res;
    },
    refetchInterval: 30000, // refresh every 30s
  });
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await apiClient.put("/api/v1/notifications/read-all", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults = [] } = useQuery<SearchResult[]>({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const res = await apiClient.get<SearchResult[]>(`/api/v1/dashboard/search?q=${encodeURIComponent(debouncedQuery)}`);
      return res;
    },
    enabled: debouncedQuery.trim().length > 0,
  });

  const { mode: theme, setMode: setTheme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const location = useLocation();
  const navigate = useNavigate();
  const activeNavGroups = user?.role === "admin" ? adminNavGroups : userNavGroups;
  const activeLabel = getActiveLabel(location.pathname, activeNavGroups);

  return (
    <div className="min-h-screen bg-app text-main flex relative">
      {/* Atmospheric glow orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.03] blur-[120px] animate-float bg-primary" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.02] blur-[100px] animate-float bg-blue-500" style={{ animationDelay: "3s" }} />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-subtle/60 bg-surface sticky top-0 h-screen z-40 relative">
        {/* Logo */}
        <div className="p-5 border-b border-subtle/40">
          <Brand />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-none px-3 py-4">
          <SidebarNav />
        </nav>

        {/* Footer - Sign Out */}
        <div className="p-3 border-t border-subtle/40">
          <button
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-muted hover:text-main hover:bg-fin-surface transition-all duration-200"
            onClick={() => void logout()}
            type="button"
          >
            <LogOut className="size-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Nav Overlay */}
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
            type="button"
          />
          <aside
            aria-label="Main navigation"
            className="relative z-10 flex h-full w-[min(20rem,85vw)] flex-col overflow-y-auto border-r border-subtle/60 bg-surface px-5 py-6 shadow-2xl"
            id="mobile-navigation"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <Brand />
              <button
                aria-label="Close navigation"
                className="rounded-xl p-2 text-muted hover:bg-fin-surface"
                onClick={() => setMobileNavOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
            
            <div className="mt-auto border-t border-subtle/40 pt-4 pb-2">
              <button
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-muted hover:text-main hover:bg-fin-surface transition-all duration-200"
                onClick={() => void logout()}
                type="button"
              >
                <LogOut className="size-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="border-b border-subtle/60 bg-surface sticky top-0 z-30 relative">
          <div className="w-full px-5 lg:px-10 xl:px-14">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <button
                  aria-controls="mobile-navigation"
                  aria-expanded={mobileNavOpen}
                  aria-label="Open navigation"
                  className="rounded-xl p-2 text-muted hover:bg-fin-surface lg:hidden"
                  onClick={() => setMobileNavOpen(true)}
                  type="button"
                >
                  <Menu className="h-5 w-5" />
                </button>

                {/* Mobile brand */}
                <div className="flex lg:hidden items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-primary/12 flex items-center justify-center glow-teal-sm">
                    <BarChart3 className="size-4 text-primary" />
                  </div>
                  <span className="text-base font-extrabold tracking-tight text-main font-display">MoneyMate</span>
                </div>

                {/* Breadcrumb */}
                <div className="hidden lg:flex items-center gap-1 text-xs text-muted font-sans">
                  <span>Dashboard</span>
                  <ChevronRight className="size-3 text-muted/50" />
                  <span className="text-main font-semibold">{activeLabel}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 relative">
                
                {/* Search Bar */}
                <div className="relative hidden md:block mr-2 z-50">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
                  <input
                    type="text"
                    placeholder="Search menus..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    className="w-48 lg:w-64 bg-fin-surface border border-subtle/40 rounded-full py-2 pl-9 pr-4 text-xs text-main placeholder:text-muted/60 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-sans"
                  />
                  {searchQuery === "" && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                      <kbd className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[9px] font-mono bg-app border border-subtle/60 text-muted">Ctrl</kbd>
                      <kbd className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[9px] font-mono bg-app border border-subtle/60 text-muted">K</kbd>
                    </div>
                  )}

                  <AnimatePresence>
                    {isSearchFocused && searchQuery.trim() !== "" && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full mt-2 w-full bg-app border border-subtle/60 shadow-xl rounded-2xl overflow-hidden py-2"
                      >
                        {searchResults.length > 0 ? (
                          searchResults.map((result, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                navigate(result.href);
                                setSearchQuery("");
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-fin-surface transition-colors flex items-center gap-3"
                            >
                              <Search className="size-4 text-muted" />
                              <span className="text-sm font-semibold text-main">{result.title}</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-center text-xs text-muted">No results found</div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative">
                  <button 
                    className="p-2.5 rounded-xl hover:bg-fin-surface transition-all duration-200 relative" 
                    aria-label="Notifications" 
                    type="button"
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      setUserMenuOpen(false);
                    }}
                  >
                    <Bell className="size-4 text-muted" />
                    {unreadCount > 0 && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-0.5 -right-0.5 size-5 rounded-full bg-primary text-app text-[9px] font-bold flex items-center justify-center font-mono">
                        {unreadCount}
                      </motion.span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notificationsOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-app border border-subtle/60 shadow-2xl z-50 overflow-hidden flex flex-col"
                        >
                          <div className="p-4 border-b border-subtle/40 flex items-center justify-between bg-fin-surface/50">
                            <h4 className="text-sm font-bold text-main font-display">Notifications</h4>
                            {unreadCount > 0 && (
                              <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">{unreadCount} New</span>
                            )}
                          </div>
                          <div className="max-h-[300px] overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="p-8 text-center text-xs text-muted">No notifications</div>
                            ) : (
                              notifications.map((notif) => (
                                <div key={notif.id} className={`p-4 border-b border-subtle/20 hover:bg-fin-surface/50 cursor-pointer transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}>
                                  <p className="text-xs font-semibold text-main">{notif.title}</p>
                                  <p className="text-[10px] text-muted mt-1 leading-relaxed">{notif.desc}</p>
                                  <p className="text-[9px] text-muted/60 font-mono mt-2">{notif.time}</p>
                                </div>
                              ))
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <div className="p-3 border-t border-subtle/40 bg-fin-surface/30 mt-auto">
                              <button 
                                className="w-full text-xs font-semibold text-primary hover:underline text-center py-1 disabled:opacity-50"
                                onClick={() => markAllAsRead.mutate()}
                                disabled={markAllAsRead.isPending}
                              >
                                {markAllAsRead.isPending ? "Updating..." : "Mark all as read"}
                              </button>
                            </div>
                          )}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative ml-1.5">
                  <button 
                    className="size-9 rounded-xl bg-primary/12 flex items-center justify-center glow-teal-sm cursor-pointer hover:bg-primary/18 transition-colors overflow-hidden"
                    onClick={() => {
                      setUserMenuOpen(!userMenuOpen);
                      setNotificationsOpen(false);
                    }}
                    type="button"
                  >
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=random`} alt={user?.full_name ?? "User"} className="w-full h-full object-cover" />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-app border border-subtle/60 shadow-2xl z-50 p-2"
                        >
                          <div className="px-3 py-3 border-b border-subtle/40 mb-2">
                            <p className="text-sm font-semibold text-main truncate">{user?.full_name}</p>
                            <p className="text-[10px] text-muted truncate font-mono mt-0.5">{user?.email}</p>
                          </div>
                          <NavLink
                            to="/dashboard/settings"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-muted hover:text-main hover:bg-fin-surface transition-colors"
                          >
                            <Settings className="size-4" />
                            <span>Settings</span>
                          </NavLink>
                          <div className="border-t border-subtle/40 my-1" />
                          <button
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-muted hover:text-main hover:bg-fin-surface transition-all duration-200 text-left"
                            onClick={() => void logout()}
                            type="button"
                          >
                            <LogOut className="size-4" />
                            <span>Sign Out</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="w-full px-5 lg:px-10 xl:px-14 py-6 lg:py-8 flex-1 relative z-10 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="size-8 rounded-xl bg-primary/12 flex items-center justify-center glow-teal-sm">
        <BarChart3 className="size-4 text-primary" />
      </div>
      <span className="text-base font-extrabold tracking-tight text-main font-display">MoneyMate</span>
    </div>
  );
}

function initials(name?: string) {
  if (!name) return "U";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function roleLabel(role?: string) {
  const labels: Record<string, string> = {
    admin: "Admin",
    user: "User",
  };
  return labels[role ?? "user"] ?? "User";
}

function getActiveLabel(pathname: string, groups: typeof userNavGroups) {
  for (const group of groups) {
    for (const item of group.items) {
      if (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))) {
        return item.label;
      }
    }
  }
  return "Overview";
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const groups = user?.role === "admin" ? adminNavGroups : userNavGroups;
  const flatItems = groups.flatMap((group) => group.items);
  
  return (
    <div className="flex flex-col gap-1 mt-2">
      {flatItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3.5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 w-full text-left font-sans ${
                isActive
                  ? "text-main bg-primary/8"
                  : "text-muted hover:text-main hover:bg-fin-surface"
              }`
            }
            end={item.href === "/dashboard"}
            key={item.href}
            onClick={onNavigate}
            to={item.href}
          >
            {({ isActive }) => (
              <motion.div whileHover={{ x: 4 }} className="flex items-center gap-3 w-full">
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div layoutId="sidebar-indicator" className="absolute right-0 top-0 bottom-0 w-1 bg-primary rounded-l-full glow-teal-sm" />
                )}
              </motion.div>
            )}
          </NavLink>
        );
      })}
    </div>
  );
}
