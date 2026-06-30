import { EmptyState } from "../../components/feedback/EmptyState";

type PlaceholderPageProps = {
  title: string;
};

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-sm text-zinc-400">MVP foundation</p>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
      </div>
      <EmptyState
        description="Konten halaman ini akan dihubungkan ke API pada task frontend MVP."
        title="Halaman belum diisi"
      />
    </div>
  );
}
