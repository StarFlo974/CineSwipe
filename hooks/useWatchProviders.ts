import { useState, useEffect } from 'react';
import { tmdb } from '../services/tmdb';
import { WatchProviderResult, MovieDetail } from '../types/movie';

// Récupère les plateformes de streaming disponibles pour un film (région FR)
export function useWatchProviders(idFilm: number) {
  const [fournisseurs, setFournisseurs] = useState<WatchProviderResult | null>(null);
  const [chargement, setChargement]    = useState(true);
  const [erreur, setErreur]            = useState<string | null>(null);

  useEffect(() => {
    let annule = false;

    async function charger() {
      setChargement(true);
      setErreur(null);
      try {
        const reponse = await tmdb.getWatchProviders(idFilm);
        if (!annule) setFournisseurs(reponse.results?.FR ?? null);
      } catch (err) {
        if (!annule) setErreur(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        if (!annule) setChargement(false);
      }
    }

    charger();
    return () => { annule = true; };
  }, [idFilm]);

  return { fournisseurs, chargement, erreur };
}

// Récupère les détails complets d'un film (casting, vidéos, etc.)
export function useMovieDetail(idFilm: number) {
  const [film, setFilm]          = useState<MovieDetail | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur]      = useState<string | null>(null);

  useEffect(() => {
    let annule = false;

    async function charger() {
      setChargement(true);
      setErreur(null);
      try {
        const detail = await tmdb.getMovie(idFilm);
        if (!annule) setFilm(detail);
      } catch (err) {
        if (!annule) setErreur(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        if (!annule) setChargement(false);
      }
    }

    charger();
    return () => { annule = true; };
  }, [idFilm]);

  return { film, chargement, erreur };
}
