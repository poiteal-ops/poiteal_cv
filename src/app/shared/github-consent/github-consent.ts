import { Component, computed, inject, signal } from '@angular/core';

import { GithubConsentService } from '../../services/github-consent.service';

@Component({
  selector: 'app-github-consent',
  templateUrl: './github-consent.html',
  styleUrl: './github-consent.scss',
  host: {
    '(document:keydown)': 'handleDocumentKeydown($event)',
  },
})
export class GithubConsent {
  protected readonly consentService = inject(GithubConsentService);
  private readonly preferencesOpen = signal(false);

  protected readonly consent = this.consentService.consent;
  protected readonly showNotice = computed(
    () => this.consentService.consent() === 'unknown' || this.preferencesOpen(),
  );

  protected openPreferences(): void {
    this.preferencesOpen.set(true);
  }

  protected allow(): void {
    this.consentService.allow();
    this.preferencesOpen.set(false);
  }

  protected decline(): void {
    this.consentService.decline();
    this.preferencesOpen.set(false);
  }

  protected handleDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.consent() !== 'unknown') {
      this.preferencesOpen.set(false);
    }
  }
}
