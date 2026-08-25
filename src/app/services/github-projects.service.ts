import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import cachedProjects from '../data/github-projects-cache.json';
import { GithubProject } from '../data/github-project';

export const GITHUB_REPOSITORIES_URL =
  'https://api.github.com/users/poiteal-ops/repos?per_page=100&sort=updated';

const EXCLUDED_REPOSITORY_NAMES = new Set(['tetsurai', 'poiteal_cv']);

interface GithubRepository {
  readonly name: string;
  readonly description?: unknown;
  readonly html_url: string;
  readonly language?: unknown;
  readonly updated_at: string;
  readonly fork: boolean;
  readonly archived: boolean;
}

function isGithubRepository(value: unknown): value is GithubRepository {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const repository = value as Record<string, unknown>;
  return (
    typeof repository['name'] === 'string' &&
    typeof repository['html_url'] === 'string' &&
    typeof repository['updated_at'] === 'string' &&
    typeof repository['fork'] === 'boolean' &&
    typeof repository['archived'] === 'boolean'
  );
}

function optionalString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

export function normalizeGithubProjects(value: unknown): readonly GithubProject[] {
  if (!Array.isArray(value)) {
    throw new TypeError('GitHub repositories response must be an array.');
  }

  return value
    .filter(isGithubRepository)
    .filter(
      (repository) =>
        !EXCLUDED_REPOSITORY_NAMES.has(repository.name.toLowerCase()) &&
        !repository.fork &&
        !repository.archived,
    )
    .map((repository) => ({ repository, timestamp: Date.parse(repository.updated_at) }))
    .filter(({ timestamp }) => !Number.isNaN(timestamp))
    .sort((left, right) => right.timestamp - left.timestamp)
    .map(({ repository }) => ({
      name: repository.name,
      description: optionalString(repository.description),
      url: repository.html_url,
      language: optionalString(repository.language),
      updatedAt: repository.updated_at,
    }));
}

function safeNormalizeGithubProjects(value: unknown): readonly GithubProject[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return normalizeGithubProjects(value);
}

@Injectable({ providedIn: 'root' })
export class GithubProjectsService {
  private readonly http = inject(HttpClient);

  readonly cachedProjects = safeNormalizeGithubProjects(cachedProjects);

  loadLiveProjects(): Observable<readonly GithubProject[]> {
    return this.http.get<unknown>(GITHUB_REPOSITORIES_URL).pipe(map(normalizeGithubProjects));
  }
}
