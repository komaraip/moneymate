export type DashboardDateRangePreset = "DAYS_30" | "DAYS_90" | "MONTHS_6" | "MONTHS_12";

export function resolveDateRangePresetWindow(preset: DashboardDateRangePreset, now = new Date()) {
  const to = new Date(now);
  const from = new Date(now);

  if (preset === "DAYS_30") {
    from.setDate(from.getDate() - 29);
  } else if (preset === "DAYS_90") {
    from.setDate(from.getDate() - 89);
  } else if (preset === "MONTHS_12") {
    from.setMonth(from.getMonth() - 11);
    from.setDate(1);
  } else {
    from.setMonth(from.getMonth() - 5);
    from.setDate(1);
  }

  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  return {
    from,
    to
  };
}

export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
