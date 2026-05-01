/// <reference types="vite/client" />

export const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock_key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mock.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "12345",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:12345:web:abcde"
};

// Fallback image cho các mục thủ công hoặc thiếu poster
export const PLACEHOLDER_IMAGE = 'https://picsum.photos/300/450?grayscale&blur=2';
