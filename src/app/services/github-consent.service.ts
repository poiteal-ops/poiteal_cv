import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

export type GithubConsent = 'unknown' | 'allowed' | 'declined';
type StoredGithubConsent = Exclude<GithubConsent, 'unknown'>;

@Injectable({ providedIn: 'root' })
export class GithubConsentService {
  private readonly storageKey = 'github-content-consent';
  private readonly storage = inject(DOCUMENT).defaultView?.localStorage;
  private readonly consentState = signal<GithubConsent>(this.readStoredConsent());

  readonly consent = this.consentState.asReadonly();

  allow(): void {
    this.setConsent('allowed');
  }

  decline(): void {
    this.setConsent('declined');
  }

  private readStoredConsent(): GithubConsent {
    try {
      const stored = this.storage?.getItem(this.storageKey);
      return stored === 'allowed' || stored === 'declined' ? stored : 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private setConsent(value: StoredGithubConsent): void {
    this.consentState.set(value);

    try {
      this.storage?.setItem(this.storageKey, value);
    } catch {
      // The current-session choice remains available when browser storage is denied.
    }
  }
}
