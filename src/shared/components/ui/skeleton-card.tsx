import Skeleton from './skeleton';
/** Cùng hình học với PosterCard; metadata giữ trong khung poster. */
export default function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      className="relative aspect-2/3 rounded-poster overflow-hidden border border-border bg-surface"
    >
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="absolute top-2 left-2 flex flex-col gap-1.5">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-10" />
      </div>
      <div className="absolute inset-x-2.5 bottom-3 space-y-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-2 w-1/2" />
      </div>
    </div>
  );
}
