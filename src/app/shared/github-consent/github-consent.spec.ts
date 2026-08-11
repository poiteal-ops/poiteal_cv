import { TestBed } from '@angular/core/testing';

import { GithubConsentService } from '../../services/github-consent.service';
import { GithubConsent } from './github-consent';

describe('GithubConsent', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
  });

  function createComponent() {
    const fixture = TestBed.configureTestingModule({ imports: [GithubConsent] }).createComponent(GithubConsent);
    fixture.detectChanges();
    return fixture;
  }

  function buttonByText(element: HTMLElement, text: string): HTMLButtonElement {
    const button = [...element.querySelectorAll('button')].find((candidate) => candidate.textContent?.trim() === text);

    if (!(button instanceof HTMLButtonElement)) {
      throw new Error(`Could not find button with text: ${text}`);
    }

    return button;
  }

  function notice(element: HTMLElement): HTMLElement | null {
    return element.querySelector('[role="dialog"]');
  }

  it('shows a non-modal GitHub disclosure while consent is unknown', () => {
    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;
    const dialog = notice(element);

    expect(dialog?.textContent).toContain(
      'Loading live projects connects your browser to GitHub. GitHub receives your IP address and browser request details.',
    );
    expect(buttonByText(element, 'Allow GitHub content')).toBeTruthy();
    expect(buttonByText(element, 'Continue without GitHub')).toBeTruthy();
    expect(buttonByText(element, 'Privacy preferences')).toBeTruthy();
    expect(dialog?.getAttribute('aria-modal')).toBe('false');

    const headingId = dialog?.getAttribute('aria-labelledby');
    expect(headingId).toBeTruthy();
    expect(headingId ? dialog?.querySelector(`#${headingId}`) : null).toBeTruthy();
  });

  it('keeps the notice scrollable within a short viewport', () => {
    const fixture = createComponent();
    const dialog = notice(fixture.nativeElement as HTMLElement);

    const styles = getComputedStyle(dialog as Element);

    expect(styles.maxHeight).toContain('100dvh');
    expect(styles.overflowY).toBe('auto');
  });

  it('shows only Privacy preferences when a choice was stored', () => {
    localStorage.setItem('github-content-consent', 'allowed');

    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;

    expect(notice(element)).toBeNull();
    expect(buttonByText(element, 'Privacy preferences')).toBeTruthy();
  });

  it('allows GitHub content, persists the choice, and closes the notice', () => {
    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;

    buttonByText(element, 'Allow GitHub content').click();
    fixture.detectChanges();

    expect(TestBed.inject(GithubConsentService).consent()).toBe('allowed');
    expect(localStorage.getItem('github-content-consent')).toBe('allowed');
    expect(notice(element)).toBeNull();
  });

  it('declines GitHub content, persists the choice, and closes the notice', () => {
    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;

    buttonByText(element, 'Continue without GitHub').click();
    fixture.detectChanges();

    expect(TestBed.inject(GithubConsentService).consent()).toBe('declined');
    expect(localStorage.getItem('github-content-consent')).toBe('declined');
    expect(notice(element)).toBeNull();
  });

  it('reopens privacy preferences for an allowed choice', () => {
    localStorage.setItem('github-content-consent', 'allowed');
    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;

    buttonByText(element, 'Privacy preferences').click();
    fixture.detectChanges();

    expect(notice(element)).toBeTruthy();
  });

  it('reopens privacy preferences for a declined choice', () => {
    localStorage.setItem('github-content-consent', 'declined');
    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;

    buttonByText(element, 'Privacy preferences').click();
    fixture.detectChanges();

    expect(notice(element)).toBeTruthy();
  });

  it('changes an allowed choice to declined', () => {
    localStorage.setItem('github-content-consent', 'allowed');
    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;

    buttonByText(element, 'Privacy preferences').click();
    fixture.detectChanges();
    buttonByText(element, 'Continue without GitHub').click();
    fixture.detectChanges();

    expect(TestBed.inject(GithubConsentService).consent()).toBe('declined');
    expect(localStorage.getItem('github-content-consent')).toBe('declined');
  });

  it('changes a declined choice to allowed', () => {
    localStorage.setItem('github-content-consent', 'declined');
    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;

    buttonByText(element, 'Privacy preferences').click();
    fixture.detectChanges();
    buttonByText(element, 'Allow GitHub content').click();
    fixture.detectChanges();

    expect(TestBed.inject(GithubConsentService).consent()).toBe('allowed');
    expect(localStorage.getItem('github-content-consent')).toBe('allowed');
  });

  it('closes reopened preferences when Escape is pressed', () => {
    localStorage.setItem('github-content-consent', 'allowed');
    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;

    buttonByText(element, 'Privacy preferences').click();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(notice(element)).toBeNull();
  });

  it('keeps the required first-visit notice open when Escape is pressed', () => {
    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(notice(element)).toBeTruthy();
  });
});
