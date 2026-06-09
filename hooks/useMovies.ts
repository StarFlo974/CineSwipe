import { useState, useCallback, useRef } from 'react';
import { tmdb } from '../services/tmdb';
import { Movie } from '../types/movie';
import { useMovieStore } from './useMovieStore';

const PRELOAD_THRESHOLD = 3;

export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef(1);
  const totalPagesRef = useRef(1);
  const fetchingRef = useRef(false);

  const ignored = useMovieStore((s) => s.ignored);
  const watched = useMovieStore((s) => s.watched);
  const watchlist = useMovieStore((s) => s.watchlist);
  const selectedGenres = useMovieStore((s) => s.selectedGenres);

  const seenIds = new Set([
    ...ignored,
    ...watched.map((w) => w.movie.id),
    ...watchlist.map((m) => m.id),
  ]);

  const filterMovies = useCallback(
    (rawMovies: Movie[]): Movie[] =>
      rawMovies.filter((m) => !seenIds.has(m.id) && m.poster_path),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ignored.length, watched.length, watchlist.length]
  );

  const loadPage = useCallback(async (page: number) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const response = await tmdb.discoverMovies(page, selectedGenres);
      totalPagesRef.current = response.total_pages;
      const filtered = filterMovies(response.results);
      setMovies((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const unique = filtered.filter((m) => !existingIds.has(m.id));
        return [...prev, ...unique];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      fetchingRef.current = false;
    }
  }, [filterMovies, selectedGenres]);

  const initialize = useCallback(async (genresOverride?: number[]) => {
    const genres = genresOverride ?? selectedGenres;
    setLoading(true);
    setError(null);
    pageRef.current = 1;
    setMovies([]);
    try {
      let rawResults;
      if (genres.length > 0) {
        // Filtre actif : seulement discover pour respecter les genres
        const discover = await tmdb.discoverMovies(1, genres);
        totalPagesRef.current = discover.total_pages;
        rawResults = discover.results;
      } else {
        // Pas de filtre : mix trending + discover pour la variété
        const [trending, discover] = await Promise.all([
          tmdb.trendingMovies(1),
          tmdb.discoverMovies(1, []),
        ]);
        totalPagesRef.current = discover.total_pages;
        rawResults = [...trending.results, ...discover.results];
      }
      const unique = rawResults.filter(
        (m, index, self) => m.poster_path && self.findIndex((o) => o.id === m.id) === index
      );
      setMovies(filterMovies(unique));
      pageRef.current = 2;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [filterMovies, selectedGenres]);

  const onCardConsumed = useCallback(
    (remainingCount: number) => {
      if (remainingCount <= PRELOAD_THRESHOLD && !fetchingRef.current) {
        const nextPage = pageRef.current;
        if (nextPage <= totalPagesRef.current) {
          pageRef.current += 1;
          loadPage(nextPage);
        }
      }
    },
    [loadPage]
  );

  const removeTopMovie = useCallback(() => {
    setMovies((prev) => prev.slice(1));
  }, []);

  return {
    movies,
    loading,
    error,
    initialize,
    onCardConsumed,
    removeTopMovie,
  };
}
