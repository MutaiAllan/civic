export default function LoadingSpinner({ size = 20 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin"
    />
  );
}
