import React from 'react';
import { TMDBPerson } from '../../types';
import { TMDB_IMAGE_BASE_URL } from '../../constants';
import { User } from 'lucide-react';

interface PersonCardProps {
  person: TMDBPerson;
  onClick: (id: number) => void;
}

const PersonCard: React.FC<PersonCardProps> = ({ person, onClick }) => {
  return (
    <div
      onClick={() => onClick(person.id)}
      className="group relative bg-surface rounded-xl overflow-hidden border border-black/5 dark:border-white/5 cursor-pointer hover:shadow-lg transition-all"
    >
      <div className="aspect-2/3 w-full relative overflow-hidden">
        {person.profile_path ? (
          <img
            src={`${TMDB_IMAGE_BASE_URL}${person.profile_path}`}
            alt={person.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-text-muted">
            <User size={32} />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-1" title={person.name}>
          {person.name}
        </h3>
        <p className="text-xs text-text-muted mt-1">
          {person.known_for_department || 'N/A'}
        </p>
        {person.known_for && person.known_for.length > 0 && (
          <p className="text-xs text-text-muted mt-1 line-clamp-1">
            {person.known_for.map(m => m.title || m.name).filter(Boolean).slice(0, 2).join(', ')}
          </p>
        )}
      </div>
    </div>
  );
};

export default PersonCard;
