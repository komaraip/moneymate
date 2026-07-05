import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { motion } from "framer-motion";
import { UserCog, Mail, Palette } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../helpers/api-client";

type NotificationSettings = {
  budgetAlerts: boolean;
  weeklySummaries: boolean;
  transactionAlerts: boolean;
  securityAlerts: boolean;
};

export function SettingsPage() {
  const { user } = useAuth();
  const { mode, setMode } = useTheme();
  const queryClient = useQueryClient();

  const { data: notifications = {
    budgetAlerts: true,
    weeklySummaries: false,
    transactionAlerts: true,
    securityAlerts: true
  }, isLoading } = useQuery<NotificationSettings>({
    queryKey: ["notificationSettings"],
    queryFn: async () => {
      const res = await apiClient.get<NotificationSettings>("/api/v1/notifications/settings");
      return res;
    }
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: NotificationSettings) => {
      await apiClient.put("/api/v1/notifications/settings", newSettings);
    },
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: ["notificationSettings"] });
      const previousSettings = queryClient.getQueryData(["notificationSettings"]);
      queryClient.setQueryData(["notificationSettings"], newSettings);
      return { previousSettings };
    },
    onError: (err, newSettings, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(["notificationSettings"], context.previousSettings);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationSettings"] });
    }
  });

  const toggleNotification = (key: keyof NotificationSettings) => {
    if (isLoading) return;
    const newSettings = { ...notifications, [key]: !notifications[key] };
    updateSettings.mutate(newSettings);
  };

  return (
    <div className="flex flex-col gap-5 min-h-[calc(100vh-8rem)]">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative overflow-hidden pt-2 pb-4">
        <h3 className="text-xl font-bold text-main font-display tracking-tight">Account Settings</h3>
        <p className="text-sm text-muted mt-1 font-sans">Manage your profile and display preferences</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="rounded-2xl bg-fin-surface p-5 lg:p-7 card-shadow">
        <div className="flex flex-col gap-10">
          
          {/* Profile Section */}
          <div className="flex flex-col gap-6">
            <div>
              <h4 className="text-sm font-bold text-main font-display">Personal Information</h4>
              <p className="text-xs text-muted mt-0.5 font-sans">Your account details</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-2xl bg-primary/15 flex items-center justify-center glow-teal-sm overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=random&size=64`} alt={user?.full_name ?? "User"} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-bold text-main font-display">{user?.full_name ?? "User"}</p>
                <p className="text-xs text-muted font-sans uppercase">{user?.role ?? "User"}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Full Name", value: user?.full_name ?? "-", icon: UserCog },
                { label: "Email", value: user?.email ?? "-", icon: Mail },
              ].map((field, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold text-muted uppercase tracking-[0.06em] font-sans">{field.label}</label>
                  <div className="flex items-center gap-2.5 bg-app/30 rounded-xl px-4 py-3 border border-subtle/30">
                    <field.icon className="size-4 text-muted shrink-0" />
                    <span className="text-sm text-main font-sans">{field.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-subtle/30" />

          {/* Notifications Section */}
          <div className="flex flex-col gap-6">
            <div>
              <h4 className="text-sm font-bold text-main font-display">Notification Preferences</h4>
              <p className="text-xs text-muted mt-0.5 font-sans">Choose how you want to be notified</p>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { id: "budgetAlerts", label: "Budget Alerts", desc: "Dapatkan notifikasi saat pengeluaran mendekati batas anggaran." },
                { id: "weeklySummaries", label: "Weekly Summaries", desc: "Terima ringkasan mingguan tentang arus kas dan aset Anda." },
                { id: "transactionAlerts", label: "Transaction Alerts", desc: "Peringatan untuk transaksi masuk/keluar bernominal besar." },
                { id: "securityAlerts", label: "Security Alerts", desc: "Notifikasi untuk login perangkat baru atau ubah sandi." },
              ].map((item, i) => {
                const enabled = notifications[item.id as keyof NotificationSettings];
                return (
                  <div key={i} className={`flex items-center justify-between ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div>
                      <p className="text-sm font-semibold text-main font-sans">{item.label}</p>
                      <p className="text-xs text-muted mt-0.5 font-sans">{item.desc}</p>
                    </div>
                    <button 
                      className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${enabled ? "bg-primary" : "bg-subtle"}`}
                      onClick={() => toggleNotification(item.id as keyof NotificationSettings)}
                      type="button"
                    >
                      <div className={`absolute top-0.5 size-5 rounded-full bg-app shadow-sm transition-transform duration-300 ${enabled ? "translate-x-5.5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-subtle/30" />

          {/* Display Section */}
          <div className="flex flex-col gap-5">
            <div>
              <h4 className="text-sm font-bold text-main font-display">Display Preferences</h4>
              <p className="text-xs text-muted mt-0.5 font-sans">Customize how the dashboard looks</p>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-app/20 border border-subtle/30 gap-3">
              <div className="flex items-start sm:items-center gap-3.5">
                <Palette className="size-4 text-muted mt-1 sm:mt-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-main font-sans truncate">Theme</p>
                  <p className="text-xs text-muted font-sans line-clamp-1 sm:line-clamp-none">Choose your preferred color scheme</p>
                </div>
              </div>
              
              <div className="flex bg-subtle/30 p-1.5 rounded-xl border border-subtle/50 self-start sm:self-auto relative isolate">
                {["light", "dark"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMode(t as "light" | "dark")}
                    className={`relative w-20 py-2 rounded-lg text-xs font-bold font-mono transition-colors z-10 capitalize flex items-center justify-center ${
                      mode === t ? "text-zinc-50" : "text-muted hover:text-main"
                    }`}
                  >
                    {mode === t && (
                      <motion.div
                        layoutId="theme-slider"
                        className="absolute inset-0 bg-primary shadow-md rounded-lg -z-10"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    {t}
                  </button>
                ))}
              </div>
            </div>
            
          </div>

        </div>
      </motion.div>
    </div>
  );
}
