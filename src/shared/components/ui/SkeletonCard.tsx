/** Skeleton matching MovieCard geometry: poster + metadata, no layout shift. */
function SkeletonCard() {
  return (
    <div aria-hidden="true" className="flex flex-col bg-surface rounded-2xl overflow-hidden border border-border h-full motion-safe:animate-pulse motion-reduce:animate-none">
      <div className="aspect-2/3 w-full bg-black/5 dark:bg-white/5" />
      <div className="p-3 flex flex-col flex-1 space-y-3">
        <div className="space-y-2">
          <div className="h-4 bg-black/10 dark:bg-white/10 rounded-md w-3/4" />
          <div className="h-3 bg-black/5 dark:bg-white/5 rounded-md w-1/2" />
        </div>
        <div className="mt-auto pt-2 border-t border-border flex items-center justify-between">
          <div className="h-3 bg-black/5 dark:bg-white/5 rounded-md w-1/3" />
          <div className="h-4 w-4 bg-black/5 dark:bg-white/5 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export default SkeletonCard;
