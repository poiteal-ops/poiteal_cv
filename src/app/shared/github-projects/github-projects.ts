import { Component, effect, inject, signal } from '@angular/core';

import { GithubProject } from '../../data/github-project';
import { GithubConsentService } from '../../services/github-consent.service';
import { GithubProjectsService } from '../../services/github-projects.service';
import { GithubConsent } from '../github-consent/github-consent';

type GithubProjectsStatus = 'saved' | 'declined' | 'refreshing' | 'live' | 'failed';

@Component({
  selector: 'app-github-projects',
  imports: [GithubConsent],
  templateUrl: './github-projects.html',
  styleUrl: './github-projects.scss',
})
export class GithubProjects {
  private readonly projectsService = inject(GithubProjectsService);
  private readonly consentService = inject(GithubConsentService);

  protected readonly projects = signal<readonly GithubProject[]>(
    this.projectsService.cachedProjects,
  );
  protected readonly status = signal<GithubProjectsStatus>('saved');

  constructor() {
    effect((onCleanup) => {
      const consent = this.consentService.consent();

      this.projects.set(this.projectsService.cachedProjects);

      if (consent === 'unknown') {
        this.status.set('saved');
        return;
      }

      if (consent === 'declined') {
        this.status.set('declined');
        return;
      }

      this.status.set('refreshing');
      const subscription = this.projectsService.loadLiveProjects().subscribe({
        next: (projects) => {
          this.projects.set(projects);
          this.status.set('live');
        },
        error: () => {
          this.projects.set(this.projectsService.cachedProjects);
          this.status.set('failed');
        },
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }
}
