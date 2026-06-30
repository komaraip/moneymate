type PageHeaderProps = {
  title: string;
  description: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <p className="text-sm text-zinc-400">{description}</p>
      <h2 className="mt-1 text-2xl font-semibold text-white">{title}</h2>
    </div>
  );
}
