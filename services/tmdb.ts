import {
  Movie,
  MovieDetail,
  TMDBDiscoverResponse,
  GenreListResponse,
  WatchProviderResponse,
} from '../types/movie';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.EXPO_PUBLIC_TMDB_KEY ?? '';
export const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const posterUrl = (path: string | null, size: 'w342' | 'w500' | 'w780' | 'original' = 'w500') =>
  path ? `${IMAGE_BASE}/${size}${path}` : null;

export const backdropUrl = (path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280') =>
  path ? `${IMAGE_BASE}/${size}${path}` : null;

export const profileUrl = (path: string | null, size: 'w185' | 'w342' = 'w185') =>
  path ? `${IMAGE_BASE}/${size}${path}` : null;

async function request<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
  const query = new URLSearchParams({
    language: 'fr-FR',
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  });

  const url = `${BASE_URL}${endpoint}?${query.toString()}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });

  if (!response.ok) {
    throw new Error(`TMDB API error ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const tmdb = {
  discoverMovies: (page = 1, genreIds: number[] = []) =>
    request<TMDBDiscoverResponse>('/discover/movie', {
      page,
      sort_by: 'popularity.desc',
      include_adult: 'false',
      include_video: 'false',
      ...(genreIds.length > 0 ? { with_genres: genreIds.join(',') } : {}),
    }),

  trendingMovies: (page = 1) =>
    request<TMDBDiscoverResponse>('/trending/movie/week', { page }),

  getMovie: (id: number) =>
    request<MovieDetail>(`/movie/${id}`, {
      append_to_response: 'credits,videos',
    }),

  getGenres: () => request<GenreListResponse>('/genre/movie/list'),

  getWatchProviders: (movieId: number) =>
    request<WatchProviderResponse>(`/movie/${movieId}/watch/providers`),

  searchMovies: (query: string, page = 1) =>
    request<TMDBDiscoverResponse>('/search/movie', { query, page }),

  getSimilarMovies: (movieId: number, page = 1) =>
    request<TMDBDiscoverResponse>(`/movie/${movieId}/similar`, { page }),

  getYoutubeTrailerKey: async (movieId: number): Promise<string | null> => {
    try {
      const detail = await tmdb.getMovie(movieId);
      const videos = detail.videos?.results ?? [];
      const trailer =
        videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube' && v.official) ??
        videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube') ??
        videos.find((v) => v.site === 'YouTube');
      return trailer?.key ?? null;
    } catch {
      return null;
    }
  },

  getDirector: (movie: MovieDetail): string => {
    const director = movie.credits?.crew.find((c) => c.job === 'Director');
    return director?.name ?? 'Inconnu';
  },

  formatRuntime: (minutes: number): string => {
    if (!minutes) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ''}` : `${m}min`;
  },

  getReleaseYear: (movie: Movie): string =>
    movie.release_date ? movie.release_date.slice(0, 4) : '',
};

export const STREAMING_LOGO_BASE = `${IMAGE_BASE}/w92`;
