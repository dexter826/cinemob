import { TMDBPerson } from '@/types';
import { getTMDBImageUrl } from '@/features/movies/utils/movieUtils';

interface PersonCardProps {
  person: TMDBPerson;
  onClick: (id: number) => void;
}

/** Thẻ hiển thị nghệ sĩ, diễn viên trong kết quả tìm kiếm. */
function PersonCard({ person, onClick }: PersonCardProps) {
  return (
    <article className="group relative bg-surface rounded-dialog overflow-hidden border border-border">
      <button
        type="button"
        onClick={() => onClick(person.id)}
        aria-label={`Xem thông tin nghệ sĩ ${person.name}`}
        className="block w-full text-left cursor-pointer rounded-none"
      >
        <div className="aspect-2/3 w-full relative overflow-hidden bg-black/5 dark:bg-white/5">
          <img
            src={getTMDBImageUrl(person.profile_path, 'h632')}
            alt={person.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </button>
      <div className="p-4 bg-surface border-t border-border-default">
        <h3
          className="font-bold text-sm line-clamp-1 tracking-tight text-text-primary group-hover:text-primary transition-colors font-display"
          title={person.name}
        >
          {person.name}
        </h3>
        <p className="text-xs font-medium text-text-secondary mt-1">
          {person.known_for_department || 'Nghệ sĩ'}
        </p>
        {person.known_for && person.known_for.length > 0 && (
          <p className="text-xs text-text-secondary mt-2 line-clamp-1 font-medium opacity-80 italic">
            {person.known_for
              .map((m) => m.title || m.name)
              .filter(Boolean)
              .slice(0, 2)
              .join(' • ')}
          </p>
        )}
      </div>
    </article>
  );
}

export default PersonCard;
