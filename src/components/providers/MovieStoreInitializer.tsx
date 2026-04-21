import { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import useMovieStore from '../../stores/movieStore';
import useInitialLoadStore from '../../stores/initialLoadStore';

/** Khởi tạo và đồng bộ dữ liệu phim toàn cục. */
const MovieStoreInitializer: React.FC = () => {
  const { user } = useAuth();
  const { initialize, cleanup, initialized } = useMovieStore();
  const { markInitialLoadComplete } = useInitialLoadStore();

  useEffect(() => {
    if (user) {
      initialize(user.uid);
    } else {
      cleanup();
    }
  }, [user, initialize, cleanup]);

  useEffect(() => {
    if (initialized) {
      markInitialLoadComplete();
    }
  }, [initialized, markInitialLoadComplete]);

  return null;
};

export default MovieStoreInitializer;
