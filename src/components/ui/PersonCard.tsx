import React from 'react';
import { TMDBPerson } from '../../types';
import { getTMDBImageUrl } from '../../utils/movieUtils';
import { User } from 'lucide-react';

interface PersonCardProps {
  person: TMDBPerson;
  onClick: (id: number) => void;
}

const PersonCard: React.FC<PersonCardProps> = ({ person, onClick }) => {
  return (
    <div
      onClick={() => onClick(person.id)}
      className="group relative bg-surface rounded-3xl overflow-hidden border border-border-default cursor-pointer hover:shadow-premium transition-all duration-500 hover:scale-[1.02] active:scale-95"
    >
      <div className="aspect-2/3 w-full relative overflow-hidden bg-black/5 dark:bg-white/5">
        <img
          src={getTMDBImageUrl(person.profile_path, 'h632')}
          alt={person.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div className="p-4 bg-surface/50 backdrop-blur-md">
        <h3 className="font-bold text-sm line-clamp-1 tracking-tight text-text-main group-hover:text-primary transition-colors" title={person.name}>
          {person.name}
        </h3>
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1.5 opacity-60">
          {person.known_for_department || 'Artist'}
        </p>
        {person.known_for && person.known_for.length > 0 && (
          <p className="text-[10px] text-text-muted mt-2 line-clamp-1 font-medium opacity-80 italic">
            {person.known_for.map(m => m.title || m.name).filter(Boolean).slice(0, 2).join(' • ')}
          </p>
        )}
      </div>
    </div>
  );
};

export default PersonCard;
