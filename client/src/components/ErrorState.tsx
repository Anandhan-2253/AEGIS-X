export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm text-red-200">
      {message}
    </div>
  );
}
