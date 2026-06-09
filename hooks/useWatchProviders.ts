import { useState, useEffect } from 'react';
import { tmdb } from '../services/tmdb';
import { WatchProviderResult } from '../types/movie';

export interface WatchProvidersData {
  tmdb: WatchProviderResult | null;
  loading: boolean;
  error: string | null;
}

export function useWatchProviders(movieId: number): WatchProvidersData {
  const [tmdbProviders, setTmdbProviders] = useState<WatchProviderResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const tmdbResponse = await tmdb.getWatchProviders(movieId);

        if (cancelled) return;

        setTmdbProviders(tmdbResponse.results?.FR ?? null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erreur de chargement');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [movieId]);

  return { tmdb: tmdbProviders, loading, error };
}

export function useMovieDetail(movieId: number) {
  const [movie, setMovie] = useState<import('../types/movie').MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const detail = await tmdb.getMovie(movieId);
        if (!cancelled) setMovie(detail);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erreur de chargement');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [movieId]);

  return { movie, loading, error };
}
