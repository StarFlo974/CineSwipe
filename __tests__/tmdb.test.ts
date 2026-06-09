/**
 * Tests fonctionnels — services/tmdb (fonctions pures uniquement)
 * Couvre : URLs d'images, formatRuntime, getReleaseYear, getDirector
 */
import { posterUrl, backdropUrl, profileUrl, tmdb, IMAGE_BASE } from '../services/tmdb';
import type { MovieDetail } from '../types/movie';

// ── URLs d'images ─────────────────────────────────────────────────────────

describe('URLs d\'images TMDB', () => {

  test('TC-31 : posterUrl construit l\'URL complète avec la taille par défaut (w500)', () => {
    const url = posterUrl('/inception.jpg');
    expect(url).toBe(`${IMAGE_BASE}/w500/inception.jpg`);
  });

  test('TC-32 : posterUrl respecte la taille demandée (w342)', () => {
    const url = posterUrl('/test.jpg', 'w342');
    expect(url).toBe(`${IMAGE_BASE}/w342/test.jpg`);
  });

  test('TC-33 : posterUrl retourne null quand le path est null', () => {
    expect(posterUrl(null)).toBeNull();
  });

  test('TC-34 : backdropUrl construit l\'URL avec la taille par défaut (w1280)', () => {
    const url = backdropUrl('/backdrop.jpg');
    expect(url).toBe(`${IMAGE_BASE}/w1280/backdrop.jpg`);
  });

  test('TC-35 : backdropUrl respecte la taille demandée (w780)', () => {
    const url = backdropUrl('/backdrop.jpg', 'w780');
    expect(url).toContain('/w780/');
  });

  test('TC-36 : backdropUrl retourne null quand le path est null', () => {
    expect(backdropUrl(null)).toBeNull();
  });

  test('TC-37 : profileUrl construit l\'URL correcte', () => {
    const url = profileUrl('/actor.jpg', 'w185');
    expect(url).toBe(`${IMAGE_BASE}/w185/actor.jpg`);
  });

  test('TC-38 : profileUrl retourne null quand le path est null', () => {
    expect(profileUrl(null)).toBeNull();
  });
});

// ── formatRuntime ─────────────────────────────────────────────────────────

describe('formatRuntime — Formatage de la durée', () => {

  test('TC-39 : formate correctement heures et minutes (ex : 130min → "2h 10min")', () => {
    expect(tmdb.formatRuntime(130)).toBe('2h 10min');
  });

  test('TC-40 : formate les heures seules quand les minutes sont 0 (ex : 120min → "2h")', () => {
    expect(tmdb.formatRuntime(120)).toBe('2h');
  });

  test('TC-41 : formate les minutes seules quand moins d\'une heure (ex : 45min)', () => {
    expect(tmdb.formatRuntime(45)).toBe('45min');
  });

  test('TC-42 : retourne une chaîne vide pour 0 minute', () => {
    expect(tmdb.formatRuntime(0)).toBe('');
  });
});

// ── getReleaseYear ────────────────────────────────────────────────────────

describe('getReleaseYear — Extraction de l\'année', () => {

  test('TC-43 : extrait correctement l\'année d\'une date complète', () => {
    const movie = { release_date: '2010-07-16' } as any;
    expect(tmdb.getReleaseYear(movie)).toBe('2010');
  });

  test('TC-44 : retourne une chaîne vide quand la date est absente', () => {
    const movie = { release_date: '' } as any;
    expect(tmdb.getReleaseYear(movie)).toBe('');
  });
});

// ── getDirector ───────────────────────────────────────────────────────────

describe('getDirector — Réalisateur', () => {

  test('TC-45 : retourne le nom du réalisateur depuis les crédits', () => {
    const detail = {
      credits: {
        cast: [],
        crew: [
          { id: 1, name: 'Christopher Nolan', job: 'Director', department: 'Directing', profile_path: null },
          { id: 2, name: 'Hans Zimmer', job: 'Composer', department: 'Sound', profile_path: null },
        ],
      },
    } as unknown as MovieDetail;
    expect(tmdb.getDirector(detail)).toBe('Christopher Nolan');
  });

  test('TC-46 : retourne "Inconnu" quand aucun réalisateur n\'est présent', () => {
    const detail = {
      credits: { cast: [], crew: [] },
    } as unknown as MovieDetail;
    expect(tmdb.getDirector(detail)).toBe('Inconnu');
  });
});
