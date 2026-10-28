import Skeleton from './skeleton';

interface SkeletonCardProps {
  badges?: 0 | 1 | 2 | 3;
}

const BADGE_WIDTHS = ['w-14', 'w-10', 'w-10'] as const;

/** Cùng hình học với PosterCard; metadata giữ trong khung poster. */
export default function SkeletonCard({ badges = 2 }: SkeletonCardProps) {
  return (
    <div
      aria-hidden="true"
      className="relative aspect-2/3 rounded-poster overflow-hidden border border-border bg-surface"
    >
      <Skeleton className="absolute inset-0 rounded-none" />
      {badges > 0 && (
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {BADGE_WIDTHS.slice(0, badges).map((width, index) => (
            <Skeleton key={index} className={`h-4 ${width}`} />
          ))}
        </div>
      )}
      <div className="absolute inset-x-2.5 bottom-2.5 space-y-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-2 w-1/2" />
      </div>
    </div>
  );
}
