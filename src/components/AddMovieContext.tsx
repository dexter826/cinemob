import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Movie, TMDBMovieResult } from '../types';

interface AddMovieContextType {
  isOpen: boolean;
  initialData: {
    tmdbId?: number;
    movie?: TMDBMovieResult; // From search
    movieToEdit?: Movie;     // For editing
    mediaType?: 'movie' | 'tv';
  } | null;
  openAddModal: (data?: AddMovieContextType['initialData']) => void;
  closeAddModal: () => void;
}

const AddMovieContext = createContext<AddMovieContextType | undefined>(undefined);

export const useAddMovie = () => {
  const context = useContext(AddMovieContext);
  if (!context) {
    throw new Error('useAddMovie must be used within an AddMovieProvider');
  }
  return context;
};

export const AddMovieProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialData, setInitialData] = useState<AddMovieContextType['initialData']>(null);

  const openAddModal = (data: AddMovieContextType['initialData'] = null) => {
    setInitialData(data);
    setIsOpen(true);
  };

  const closeAddModal = () => {
    setIsOpen(false);
    setInitialData(null);
  };

  return (
    <AddMovieContext.Provider value={{ isOpen, initialData, openAddModal, closeAddModal }}>
      {children}
    </AddMovieContext.Provider>
  );
};
