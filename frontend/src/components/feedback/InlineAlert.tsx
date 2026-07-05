type InlineAlertProps = {
  messages: string[];
  tone?: "warning" | "success" | "error";
};

const toneClass = {
  error: "border-fin-loss/20 bg-fin-loss/5 text-fin-loss",
  success: "border-fin-gain/20 bg-fin-gain/5 text-fin-gain",
  warning: "border-warning/20 bg-warning/5 text-warning",
};

export function InlineAlert({ messages, tone = "warning" }: InlineAlertProps) {
  const items = messages.filter(Boolean);
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`rounded-xl border px-4 py-3 text-xs font-sans ${toneClass[tone]}`}>
      {items.map((message) => (
        <p key={message}>{message}</p>
      ))}
    </div>
  );
}
