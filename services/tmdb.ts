import {
  Movie,
  MovieDetail,
  TMDBDiscoverResponse,
  GenreListResponse,
  WatchProviderResponse,
} from '../types/movie';

const URL_BASE = 'https://api.themoviedb.org/3';
const CLE_API  = process.env.EXPO_PUBLIC_TMDB_KEY ?? '';

export const IMAGE_BASE        = 'https://image.tmdb.org/t/p';
export const STREAMING_LOGO_BASE = `${IMAGE_BASE}/w92`;

// URLs d'images

export function posterUrl(chemin: string | null, taille: 'w342' | 'w500' | 'w780' | 'original' = 'w500') {
  return chemin ? `${IMAGE_BASE}/${taille}${chemin}` : null;
}

export function backdropUrl(chemin: string | null, taille: 'w780' | 'w1280' | 'original' = 'w1280') {
  return chemin ? `${IMAGE_BASE}/${taille}${chemin}` : null;
}

export function profileUrl(chemin: string | null, taille: 'w185' | 'w342' = 'w185') {
  return chemin ? `${IMAGE_BASE}/${taille}${chemin}` : null;
}

// Requête générique 

async function requete<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
  // Construire les paramètres de l'URL
  const parametres: Record<string, string> = { language: 'fr-FR' };
  for (const [cle, valeur] of Object.entries(params)) {
    parametres[cle] = String(valeur);
  }

  const url      = `${URL_BASE}${endpoint}?${new URLSearchParams(parametres)}`;
  const reponse  = await fetch(url, {
    headers: { Authorization: `Bearer ${CLE_API}` },
  });

  if (!reponse.ok) {
    throw new Error(`Erreur TMDB ${reponse.status} : ${reponse.statusText}`);
  }

  return reponse.json() as Promise<T>;
}

// API TMDB

export const tmdb = {

  discoverMovies(page = 1, genres: number[] = []) {
    const params: Record<string, string | number> = {
      page,
      sort_by: 'popularity.desc',
      include_adult: 'false',
      include_video: 'false',
    };
    if (genres.length > 0) {
      params.with_genres = genres.join(',');
    }
    return requete<TMDBDiscoverResponse>('/discover/movie', params);
  },

  trendingMovies(page = 1) {
    return requete<TMDBDiscoverResponse>('/trending/movie/week', { page });
  },

  getMovie(id: number) {
    return requete<MovieDetail>(`/movie/${id}`, { append_to_response: 'credits,videos' });
  },

  getGenres() {
    return requete<GenreListResponse>('/genre/movie/list');
  },

  getWatchProviders(idFilm: number) {
    return requete<WatchProviderResponse>(`/movie/${idFilm}/watch/providers`);
  },

  searchMovies(recherche: string, page = 1) {
    return requete<TMDBDiscoverResponse>('/search/movie', { query: recherche, page });
  },

  getSimilarMovies(idFilm: number, page = 1) {
    return requete<TMDBDiscoverResponse>(`/movie/${idFilm}/similar`, { page });
  },

  async getYoutubeTrailerKey(idFilm: number): Promise<string | null> {
    try {
      const detail = await tmdb.getMovie(idFilm);
      const videos = detail.videos?.results ?? [];

      // Priorité : trailer officiel → trailer → n'importe quelle vidéo YouTube
      for (const video of videos) {
        if (video.type === 'Trailer' && video.site === 'YouTube' && video.official) {
          return video.key;
        }
      }
      for (const video of videos) {
        if (video.type === 'Trailer' && video.site === 'YouTube') {
          return video.key;
        }
      }
      for (const video of videos) {
        if (video.site === 'YouTube') {
          return video.key;
        }
      }
      return null;
    } catch {
      return null;
    }
  },

  getDirector(film: MovieDetail): string {
    const realisateur = film.credits?.crew.find((membre) => membre.job === 'Director');
    return realisateur?.name ?? 'Inconnu';
  },

  formatRuntime(minutes: number): string {
    if (!minutes) return '';
    const heures  = Math.floor(minutes / 60);
    const restant = minutes % 60;
    if (heures > 0 && restant > 0) return `${heures}h ${restant}min`;
    if (heures > 0) return `${heures}h`;
    return `${restant}min`;
  },

  getReleaseYear(film: Movie): string {
    return film.release_date ? film.release_date.slice(0, 4) : '';
  },
};
