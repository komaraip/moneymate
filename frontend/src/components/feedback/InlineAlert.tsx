type InlineAlertProps = {
  messages: string[];
  tone?: "warning" | "success" | "error";
};

const toneClass = {
  error: "border-red-500/30 bg-red-500/10 text-red-100",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-100",
};

export function InlineAlert({ messages, tone = "warning" }: InlineAlertProps) {
  const items = messages.filter(Boolean);
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${toneClass[tone]}`}>
      {items.map((message) => (
        <p key={message}>{message}</p>
      ))}
    </div>
  );
}
