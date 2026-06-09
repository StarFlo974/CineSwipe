/**
 * Tests fonctionnels — useMovieStore
 * Couvre : watchlist, films vus, ignorés, profil, thème, genres, statistiques
 */
import { useMovieStore } from '../hooks/useMovieStore';
import type { Movie } from '../types/movie';

// ── Fixtures ──────────────────────────────────────────────────────────────

const film1: Movie = {
  id: 1,
  title: 'Inception',
  original_title: 'Inception',
  overview: 'Un voleur pénètre dans les rêves.',
  poster_path: '/inception.jpg',
  backdrop_path: '/backdrop.jpg',
  release_date: '2010-07-16',
  vote_average: 8.8,
  vote_count: 35000,
  genre_ids: [28, 878, 53], // Action, Sci-Fi, Thriller
};

const film2: Movie = {
  id: 2,
  title: 'The Dark Knight',
  original_title: 'The Dark Knight',
  overview: 'Batman affronte le Joker.',
  poster_path: '/tdk.jpg',
  backdrop_path: '/backdrop2.jpg',
  release_date: '2008-07-18',
  vote_average: 9.0,
  vote_count: 40000,
  genre_ids: [28, 80, 18], // Action, Crime, Drame
};

const resetStore = () =>
  useMovieStore.setState({
    watchlist: [],
    watched: [],
    ignored: [],
    theme: 'dark',
    selectedGenres: [],
    username: 'TestUser',
    email: '',
  });

// ── Watchlist ─────────────────────────────────────────────────────────────

describe('Watchlist — Ajout et suppression', () => {
  beforeEach(resetStore);

  test('TC-01 : addToWatchlist ajoute un film à la liste', () => {
    useMovieStore.getState().addToWatchlist(film1);
    expect(useMovieStore.getState().watchlist).toHaveLength(1);
    expect(useMovieStore.getState().watchlist[0].id).toBe(1);
  });

  test('TC-02 : addToWatchlist n\'ajoute pas de doublon', () => {
    useMovieStore.getState().addToWatchlist(film1);
    useMovieStore.getState().addToWatchlist(film1);
    expect(useMovieStore.getState().watchlist).toHaveLength(1);
  });

  test('TC-03 : addToWatchlist peut contenir plusieurs films différents', () => {
    useMovieStore.getState().addToWatchlist(film1);
    useMovieStore.getState().addToWatchlist(film2);
    expect(useMovieStore.getState().watchlist).toHaveLength(2);
  });

  test('TC-04 : removeFromWatchlist supprime le film ciblé', () => {
    useMovieStore.getState().addToWatchlist(film1);
    useMovieStore.getState().addToWatchlist(film2);
    useMovieStore.getState().removeFromWatchlist(1);
    const ids = useMovieStore.getState().watchlist.map((m) => m.id);
    expect(ids).not.toContain(1);
    expect(ids).toContain(2);
  });

  test('TC-05 : isInWatchlist retourne true pour un film présent', () => {
    useMovieStore.getState().addToWatchlist(film1);
    expect(useMovieStore.getState().isInWatchlist(1)).toBe(true);
  });

  test('TC-06 : isInWatchlist retourne false pour un film absent', () => {
    expect(useMovieStore.getState().isInWatchlist(999)).toBe(false);
  });
});

// ── Films vus ─────────────────────────────────────────────────────────────

describe('Films vus — Notation et historique', () => {
  beforeEach(resetStore);

  test('TC-07 : markAsWatched enregistre le film avec la note donnée', () => {
    useMovieStore.getState().markAsWatched(film1, 4);
    const watched = useMovieStore.getState().watched;
    expect(watched).toHaveLength(1);
    expect(watched[0].movie.id).toBe(1);
    expect(watched[0].rating).toBe(4);
  });

  test('TC-08 : markAsWatched retire automatiquement le film de la watchlist', () => {
    useMovieStore.getState().addToWatchlist(film1);
    useMovieStore.getState().markAsWatched(film1, 5);
    expect(useMovieStore.getState().watchlist).toHaveLength(0);
  });

  test('TC-09 : markAsWatched met à jour la note si le film est déjà vu', () => {
    useMovieStore.getState().markAsWatched(film1, 3);
    useMovieStore.getState().markAsWatched(film1, 5);
    const watched = useMovieStore.getState().watched;
    expect(watched).toHaveLength(1);
    expect(watched[0].rating).toBe(5);
  });

  test('TC-10 : markAsWatched enregistre la date de visionnage', () => {
    useMovieStore.getState().markAsWatched(film1, 4);
    expect(useMovieStore.getState().watched[0].watchedAt).toBeTruthy();
  });

  test('TC-11 : removeFromWatched supprime le film de l\'historique', () => {
    useMovieStore.getState().markAsWatched(film1, 4);
    useMovieStore.getState().removeFromWatched(1);
    expect(useMovieStore.getState().watched).toHaveLength(0);
  });

  test('TC-12 : isWatched retourne true pour un film vu', () => {
    useMovieStore.getState().markAsWatched(film1, 4);
    expect(useMovieStore.getState().isWatched(1)).toBe(true);
  });

  test('TC-13 : isWatched retourne false pour un film non vu', () => {
    expect(useMovieStore.getState().isWatched(999)).toBe(false);
  });
});

// ── Films ignorés ─────────────────────────────────────────────────────────

describe('Films ignorés', () => {
  beforeEach(resetStore);

  test('TC-14 : ignore ajoute l\'id à la liste des ignorés', () => {
    useMovieStore.getState().ignore(1);
    expect(useMovieStore.getState().ignored).toContain(1);
  });

  test('TC-15 : ignore ne crée pas de doublon', () => {
    useMovieStore.getState().ignore(1);
    useMovieStore.getState().ignore(1);
    expect(useMovieStore.getState().ignored).toHaveLength(1);
  });

  test('TC-16 : ignore retire le film de la watchlist', () => {
    useMovieStore.getState().addToWatchlist(film1);
    useMovieStore.getState().ignore(1);
    expect(useMovieStore.getState().watchlist).toHaveLength(0);
  });

  test('TC-17 : isIgnored retourne true pour un film ignoré', () => {
    useMovieStore.getState().ignore(1);
    expect(useMovieStore.getState().isIgnored(1)).toBe(true);
  });

  test('TC-18 : isIgnored retourne false pour un film non ignoré', () => {
    expect(useMovieStore.getState().isIgnored(999)).toBe(false);
  });
});

// ── Profil utilisateur ────────────────────────────────────────────────────

describe('Profil utilisateur', () => {
  beforeEach(resetStore);

  test('TC-19 : setProfile met à jour le nom d\'utilisateur', () => {
    useMovieStore.getState().setProfile('Alice', '');
    expect(useMovieStore.getState().username).toBe('Alice');
  });

  test('TC-20 : setProfile met à jour l\'adresse e-mail', () => {
    useMovieStore.getState().setProfile('Alice', 'alice@example.com');
    expect(useMovieStore.getState().email).toBe('alice@example.com');
  });
});

// ── Thème ─────────────────────────────────────────────────────────────────

describe('Thème (dark / light)', () => {
  beforeEach(resetStore);

  test('TC-21 : toggleTheme bascule de dark à light', () => {
    useMovieStore.getState().toggleTheme();
    expect(useMovieStore.getState().theme).toBe('light');
  });

  test('TC-22 : toggleTheme double-bascule revient au dark', () => {
    useMovieStore.getState().toggleTheme();
    useMovieStore.getState().toggleTheme();
    expect(useMovieStore.getState().theme).toBe('dark');
  });
});

// ── Filtres par genre ─────────────────────────────────────────────────────

describe('Filtres par genre', () => {
  beforeEach(resetStore);

  test('TC-23 : setSelectedGenres enregistre la sélection', () => {
    useMovieStore.getState().setSelectedGenres([28, 18]);
    expect(useMovieStore.getState().selectedGenres).toEqual([28, 18]);
  });

  test('TC-24 : setSelectedGenres accepte une liste vide (reset)', () => {
    useMovieStore.getState().setSelectedGenres([28]);
    useMovieStore.getState().setSelectedGenres([]);
    expect(useMovieStore.getState().selectedGenres).toHaveLength(0);
  });
});

// ── Statistiques ──────────────────────────────────────────────────────────

describe('Statistiques', () => {
  beforeEach(resetStore);

  test('TC-25 : getAverageRating retourne 0 quand aucun film vu', () => {
    expect(useMovieStore.getState().getAverageRating()).toBe(0);
  });

  test('TC-26 : getAverageRating calcule la moyenne exacte', () => {
    useMovieStore.getState().markAsWatched(film1, 4);
    useMovieStore.getState().markAsWatched(film2, 2);
    expect(useMovieStore.getState().getAverageRating()).toBe(3);
  });

  test('TC-27 : getAverageRating arrondit à une décimale', () => {
    useMovieStore.getState().markAsWatched(film1, 4);
    useMovieStore.getState().markAsWatched(film2, 3);
    useMovieStore.getState().markAsWatched({ ...film1, id: 3 }, 5);
    // (4+3+5)/3 = 4.0
    expect(useMovieStore.getState().getAverageRating()).toBe(4);
  });

  test('TC-28 : getGenreStats compte les genres des films vus', () => {
    useMovieStore.getState().markAsWatched(film1, 4); // genres: 28, 878, 53
    const stats = useMovieStore.getState().getGenreStats();
    expect(stats[28]).toBe(1);
    expect(stats[878]).toBe(1);
    expect(stats[53]).toBe(1);
  });

  test('TC-29 : getGenreStats cumule les films du même genre', () => {
    useMovieStore.getState().markAsWatched(film1, 4); // genre 28 (Action)
    useMovieStore.getState().markAsWatched(film2, 3); // genre 28 (Action)
    const stats = useMovieStore.getState().getGenreStats();
    expect(stats[28]).toBe(2);
  });

  test('TC-30 : getGenreStats retourne un objet vide sans films vus', () => {
    expect(useMovieStore.getState().getGenreStats()).toEqual({});
  });
});
