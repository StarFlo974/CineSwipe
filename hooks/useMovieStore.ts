import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie, WatchedMovie } from '../types/movie';
import { ThemeMode } from '../constants/theme';

export interface MovieStore {
  watchlist: Movie[];
  watched: WatchedMovie[];
  ignored: number[];
  theme: ThemeMode;
  selectedGenres: number[];
  username: string;
  email: string;
  addToWatchlist: (movie: Movie) => void;
  removeFromWatchlist: (id: number) => void;
  markAsWatched: (movie: Movie, rating: number) => void;
  removeFromWatched: (id: number) => void;
  ignore: (id: number) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setSelectedGenres: (genres: number[]) => void;
  setProfile: (username: string, email: string) => void;
  isInWatchlist: (id: number) => boolean;
  isWatched: (id: number) => boolean;
  isIgnored: (id: number) => boolean;
  getAverageRating: () => number;
  getGenreStats: () => Record<number, number>;
}

export const useMovieStore = create<MovieStore>()(
  persist(
    (set, get) => ({
      watchlist: [],
      watched: [],
      ignored: [],
      theme: 'dark',
      selectedGenres: [],
      username: 'Florian',
      email: '',

      addToWatchlist: (movie: Movie) =>
        set((state) => {
          if (state.watchlist.some((m) => m.id === movie.id)) return state;
          return { watchlist: [movie, ...state.watchlist] };
        }),

      removeFromWatchlist: (id: number) =>
        set((state) => ({
          watchlist: state.watchlist.filter((m) => m.id !== id),
        })),

      markAsWatched: (movie: Movie, rating: number) =>
        set((state) => {
          const alreadyWatched = state.watched.some((w) => w.movie.id === movie.id);
          const updatedWatched = alreadyWatched
            ? state.watched.map((w) =>
                w.movie.id === movie.id
                  ? { ...w, rating, watchedAt: new Date().toISOString() }
                  : w
              )
            : [
                { movie, rating, watchedAt: new Date().toISOString() },
                ...state.watched,
              ];
          return {
            watched: updatedWatched,
            watchlist: state.watchlist.filter((m) => m.id !== movie.id),
          };
        }),

      removeFromWatched: (id: number) =>
        set((state) => ({
          watched: state.watched.filter((w) => w.movie.id !== id),
        })),

      ignore: (id: number) =>
        set((state) => ({
          ignored: state.ignored.includes(id) ? state.ignored : [...state.ignored, id],
          watchlist: state.watchlist.filter((m) => m.id !== id),
        })),

      setTheme: (theme: ThemeMode) => set({ theme }),

      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      setSelectedGenres: (genres: number[]) => set({ selectedGenres: genres }),

      setProfile: (username: string, email: string) => set({ username, email }),

      isInWatchlist: (id: number) => get().watchlist.some((m) => m.id === id),

      isWatched: (id: number) => get().watched.some((w) => w.movie.id === id),

      isIgnored: (id: number) => get().ignored.includes(id),

      getAverageRating: () => {
        const { watched } = get();
        if (watched.length === 0) return 0;
        const sum = watched.reduce((acc, w) => acc + w.rating, 0);
        return Math.round((sum / watched.length) * 10) / 10;
      },

      getGenreStats: () => {
        const { watched } = get();
        const stats: Record<number, number> = {};
        watched.forEach((w) => {
          (w.movie.genre_ids ?? []).forEach((genreId) => {
            stats[genreId] = (stats[genreId] ?? 0) + 1;
          });
        });
        return stats;
      },
    }),
    {
      name: 'cineswipe-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
