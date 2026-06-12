import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie, WatchedMovie } from '../types/movie';
import { ThemeMode } from '../constants/theme';

export const useMovieStore = create<{
  // Données
  watchlist:      Movie[];
  watched:        WatchedMovie[];
  ignored:        number[];
  theme:          ThemeMode;
  selectedGenres: number[];
  username:       string;
  email:          string;
  // Actions
  addToWatchlist:      (film: Movie) => void;
  removeFromWatchlist: (id: number) => void;
  markAsWatched:       (film: Movie, note: number) => void;
  removeFromWatched:   (id: number) => void;
  ignore:              (id: number) => void;
  toggleTheme:         () => void;
  setSelectedGenres:   (genres: number[]) => void;
  setProfile:          (username: string, email: string) => void;
  isInWatchlist:       (id: number) => boolean;
  isWatched:           (id: number) => boolean;
  isIgnored:           (id: number) => boolean;
  getAverageRating:    () => number;
  getGenreStats:       () => Record<number, number>;
}>()(
  persist(
    (set, get) => ({
      watchlist:      [],
      watched:        [],
      ignored:        [],
      theme:          'dark',
      selectedGenres: [],
      username:       'Florian',
      email:          '',

      addToWatchlist(film: Movie) {
        set((state) => {
          if (state.watchlist.some((m) => m.id === film.id)) return state;
          return { watchlist: [film, ...state.watchlist] };
        });
      },

      removeFromWatchlist(id: number) {
        set((state) => ({ watchlist: state.watchlist.filter((m) => m.id !== id) }));
      },

      markAsWatched(film: Movie, note: number) {
        set((state) => {
          const dejaVu = state.watched.find((v) => v.movie.id === film.id);
          let nouveauxVus: WatchedMovie[];

          if (dejaVu) {
            // Met à jour la note si le film a déjà été vu
            nouveauxVus = state.watched.map((v) =>
              v.movie.id === film.id
                ? { ...v, rating: note, watchedAt: new Date().toISOString() }
                : v
            );
          } else {
            nouveauxVus = [{ movie: film, rating: note, watchedAt: new Date().toISOString() }, ...state.watched];
          }

          return {
            watched:   nouveauxVus,
            watchlist: state.watchlist.filter((m) => m.id !== film.id),
          };
        });
      },

      removeFromWatched(id: number) {
        set((state) => ({ watched: state.watched.filter((v) => v.movie.id !== id) }));
      },

      ignore(id: number) {
        set((state) => ({
          ignored:   state.ignored.includes(id) ? state.ignored : [...state.ignored, id],
          watchlist: state.watchlist.filter((m) => m.id !== id),
        }));
      },

      toggleTheme() {
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' }));
      },

      setSelectedGenres(genres: number[]) {
        set({ selectedGenres: genres });
      },

      setProfile(username: string, email: string) {
        set({ username, email });
      },

      isInWatchlist(id: number) {
        return get().watchlist.some((m) => m.id === id);
      },

      isWatched(id: number) {
        return get().watched.some((v) => v.movie.id === id);
      },

      isIgnored(id: number) {
        return get().ignored.includes(id);
      },

      getAverageRating() {
        const vus = get().watched;
        if (vus.length === 0) return 0;
        const total = vus.reduce((acc, v) => acc + v.rating, 0);
        return Math.round((total / vus.length) * 10) / 10;
      },

      getGenreStats() {
        const stats: Record<number, number> = {};
        get().watched.forEach((v) => {
          (v.movie.genre_ids ?? []).forEach((idGenre) => {
            stats[idGenre] = (stats[idGenre] ?? 0) + 1;
          });
        });
        return stats;
      },
    }),
    {
      name:    'cineswipe-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
