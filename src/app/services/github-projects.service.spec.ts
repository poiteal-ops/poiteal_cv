import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import {
  GITHUB_REPOSITORIES_URL,
  GithubProjectsService,
  normalizeGithubProjects,
} from './github-projects.service';

const repo = (overrides: Record<string, unknown> = {}) => ({
  name: 'ValidProject',
  description: 'A valid project',
  html_url: 'https://github.com/poiteal-ops/ValidProject',
  language: 'TypeScript',
  updated_at: '2026-08-01T12:00:00Z',
  fork: false,
  archived: false,
  ...overrides,
});

describe('GithubProjectsService', () => {
  let service: GithubProjectsService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GithubProjectsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('filters excluded, forked, archived, and malformed repositories and sorts newest first', () => {
    const projects = normalizeGithubProjects([
      repo({ name: 'Older', updated_at: '2026-01-01T00:00:00Z' }),
      repo({ name: 'TETSURAI' }),
      repo({ name: 'Poiteal_cv' }),
      repo({ name: 'tetsurai' }),
      repo({ name: 'POITEAL_CV' }),
      repo({ name: 'Fork', fork: true }),
      repo({ name: 'Archive', archived: true }),
      repo({ name: 42 }),
      repo({ name: 'Newest', updated_at: '2026-08-09T00:00:00Z' }),
    ]);

    expect(projects.map(({ name }) => name)).toEqual(['Newest', 'Older']);
  });

  it('throws when the top-level response is not an array', () => {
    expect(() => normalizeGithubProjects({ message: 'rate limited' })).toThrow();
  });

  it('ignores repositories with invalid update timestamps', () => {
    const projects = normalizeGithubProjects([
      repo({ name: 'InvalidDate', updated_at: 'not-a-date' }),
      repo({ name: 'ValidDate', updated_at: '2026-08-02T00:00:00Z' }),
    ]);

    expect(projects.map(({ name }) => name)).toEqual(['ValidDate']);
  });

  it('preserves nullable optional metadata and normalizes invalid optional metadata to null', () => {
    const projects = normalizeGithubProjects([
      repo({ name: 'Nullable', description: null, language: null }),
      repo({ name: 'InvalidOptional', description: 123, language: false }),
    ]);

    expect(projects).toEqual([
      {
        name: 'Nullable',
        description: null,
        url: 'https://github.com/poiteal-ops/ValidProject',
        language: null,
        updatedAt: '2026-08-01T12:00:00Z',
      },
      {
        name: 'InvalidOptional',
        description: null,
        url: 'https://github.com/poiteal-ops/ValidProject',
        language: null,
        updatedAt: '2026-08-01T12:00:00Z',
      },
    ]);
  });

  it('provides the three approved bundled projects', () => {
    expect(service.cachedProjects).toEqual([
      {
        name: 'EtterbeekCriminals',
        description: 'Mock website - Claude design',
        url: 'https://github.com/poiteal-ops/EtterbeekCriminals',
        language: 'JavaScript',
        updatedAt: '2026-08-01T17:12:16Z',
      },
      {
        name: 'OracleSchemaComp',
        description: 'Compares Oracle table(s) between two environments',
        url: 'https://github.com/poiteal-ops/OracleSchemaComp',
        language: 'Python',
        updatedAt: '2026-07-14T20:18:43Z',
      },
      {
        name: 'CsvSeparator',
        description: 'Cleans up csv files, modifies the separator and adds quotes to text',
        url: 'https://github.com/poiteal-ops/CsvSeparator',
        language: 'Python',
        updatedAt: '2026-07-14T19:58:06Z',
      },
    ]);
  });

  it('requests the public repositories URL once without authorization and normalizes the response', () => {
    let projects: unknown;

    service.loadLiveProjects().subscribe((result) => {
      projects = result;
    });

    const request = httpTesting.expectOne(GITHUB_REPOSITORIES_URL);
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.has('Authorization')).toBe(false);

    request.flush([repo({ name: 'LiveProject', description: null, language: 'Python' })]);

    expect(projects).toEqual([
      {
        name: 'LiveProject',
        description: null,
        url: 'https://github.com/poiteal-ops/ValidProject',
        language: 'Python',
        updatedAt: '2026-08-01T12:00:00Z',
      },
    ]);
  });
});
