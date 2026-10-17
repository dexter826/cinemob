interface SpinnerProps {
  size?: number;
  className?: string;
}
export default function Spinner({ size = 20, className = '' }: SpinnerProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rounded-full border-2 border-current border-t-transparent text-primary motion-safe:animate-spin motion-reduce:animate-none ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
