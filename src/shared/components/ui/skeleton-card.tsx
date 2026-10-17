import Skeleton from './skeleton';
/** Same geometry as PosterCard; metadata stays within the poster. */
export default function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      className="relative aspect-2/3 rounded-poster overflow-hidden border border-border bg-surface"
    >
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="absolute inset-x-2.5 bottom-3 space-y-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-2 w-1/2" />
      </div>
    </div>
  );
}
