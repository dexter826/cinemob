export const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY || '';
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const FIREBASE_CONFIG = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "mock_key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "mock.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "mock-project",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "mock.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "12345",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:12345:web:abcde"
};

// Fallback image for manual entries or missing posters
export const PLACEHOLDER_IMAGE = 'https://picsum.photos/300/450?grayscale&blur=2';
