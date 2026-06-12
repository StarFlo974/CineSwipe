import { useState, useRef } from 'react';
import { tmdb } from '../services/tmdb';
import { Movie } from '../types/movie';
import { useMovieStore } from './useMovieStore';

// Charge la page suivante quand il reste moins de X films dans le deck
const SEUIL_PRELOAD = 3;

export function useMovies() {
  const [films, setFilms]             = useState<Movie[]>([]);
  const [chargement, setChargement]   = useState(false);
  const [erreur, setErreur]           = useState<string | null>(null);

  const pageCourante          = useRef(1);
  const totalPages            = useRef(1);
  const enCoursDeChargement   = useRef(false);

  const ignores       = useMovieStore((s) => s.ignored);
  const vus           = useMovieStore((s) => s.watched);
  const watchlist     = useMovieStore((s) => s.watchlist);
  const genresFiltres = useMovieStore((s) => s.selectedGenres);

  // Retourne l'ensemble des IDs déjà traités (ignorés + vus + liste à voir)
  function getIdsDejaVus() {
    const ids = new Set<number>();
    ignores.forEach((id) => ids.add(id));
    vus.forEach((v) => ids.add(v.movie.id));
    watchlist.forEach((m) => ids.add(m.id));
    return ids;
  }

  // Garde uniquement les films non vus et avec une affiche disponible
  function filtrerFilms(resultats: Movie[]): Movie[] {
    const idsDejaVus = getIdsDejaVus();
    return resultats.filter((film) => !idsDejaVus.has(film.id) && film.poster_path);
  }

  // Charge une page supplémentaire et l'ajoute au deck existant
  async function chargerPage(page: number) {
    if (enCoursDeChargement.current) return;
    enCoursDeChargement.current = true;
    try {
      const reponse     = await tmdb.discoverMovies(page, genresFiltres);
      totalPages.current = reponse.total_pages;
      const nouveaux    = filtrerFilms(reponse.results);
      setFilms((prev) => {
        const idsExistants = new Set(prev.map((m) => m.id));
        return [...prev, ...nouveaux.filter((m) => !idsExistants.has(m.id))];
      });
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      enCoursDeChargement.current = false;
    }
  }

  // Réinitialise le deck depuis la page 1 (appelé au démarrage ou après un filtre)
  async function initialiser(genresOverride?: number[]) {
    const genres = genresOverride ?? genresFiltres;
    setChargement(true);
    setErreur(null);
    pageCourante.current = 1;
    setFilms([]);

    try {
      let resultats: Movie[];

      if (genres.length > 0) {
        // Filtre actif : seulement discover pour respecter les genres choisis
        const decouverte   = await tmdb.discoverMovies(1, genres);
        totalPages.current = decouverte.total_pages;
        resultats          = decouverte.results;
      } else {
        // Pas de filtre : mix tendances + découverte pour plus de variété
        const [tendances, decouverte] = await Promise.all([
          tmdb.trendingMovies(1),
          tmdb.discoverMovies(1, []),
        ]);
        totalPages.current = decouverte.total_pages;
        resultats          = [...tendances.results, ...decouverte.results];
      }

      // Dédoublonner (un film peut apparaître dans tendances ET découverte)
      const sansDoublons = resultats.filter(
        (film, index, liste) => film.poster_path && liste.findIndex((f) => f.id === film.id) === index
      );
      setFilms(filtrerFilms(sansDoublons));
      pageCourante.current = 2;
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setChargement(false);
    }
  }

  // Appelé après chaque swipe pour déclencher le preload si besoin
  function surCarteConsommee(nbRestants: number) {
    if (nbRestants <= SEUIL_PRELOAD && !enCoursDeChargement.current) {
      const prochainePage = pageCourante.current;
      if (prochainePage <= totalPages.current) {
        pageCourante.current += 1;
        chargerPage(prochainePage);
      }
    }
  }

  function supprimerPremierFilm() {
    setFilms((prev) => prev.slice(1));
  }

  return {
    films,
    chargement,
    erreur,
    initialiser,
    surCarteConsommee,
    supprimerPremierFilm,
  };
}
