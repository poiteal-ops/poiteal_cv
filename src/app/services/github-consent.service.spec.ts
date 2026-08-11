import { TestBed } from '@angular/core/testing';

import { GithubConsentService } from './github-consent.service';

describe('GithubConsentService', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with unknown consent when nothing is stored', () => {
    const service = TestBed.inject(GithubConsentService);

    expect(service.consent()).toBe('unknown');
  });

  it('allows GitHub content and stores the choice', () => {
    const service = TestBed.inject(GithubConsentService);

    service.allow();

    expect(service.consent()).toBe('allowed');
    expect(localStorage.getItem('github-content-consent')).toBe('allowed');
  });

  it('declines GitHub content and stores the choice', () => {
    const service = TestBed.inject(GithubConsentService);

    service.decline();

    expect(service.consent()).toBe('declined');
    expect(localStorage.getItem('github-content-consent')).toBe('declined');
  });

  it('restores an allowed stored choice', () => {
    localStorage.setItem('github-content-consent', 'allowed');

    const service = TestBed.inject(GithubConsentService);

    expect(service.consent()).toBe('allowed');
  });

  it('restores a declined stored choice', () => {
    localStorage.setItem('github-content-consent', 'declined');

    const service = TestBed.inject(GithubConsentService);

    expect(service.consent()).toBe('declined');
  });

  it('ignores an invalid stored choice', () => {
    localStorage.setItem('github-content-consent', 'maybe');

    const service = TestBed.inject(GithubConsentService);

    expect(service.consent()).toBe('unknown');
  });

  it('returns unknown when reading storage is denied', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage denied');
    });

    const service = TestBed.inject(GithubConsentService);

    expect(service.consent()).toBe('unknown');
  });

  it('keeps the current-session choice when writing storage is denied', () => {
    const service = TestBed.inject(GithubConsentService);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage denied');
    });

    service.allow();

    expect(service.consent()).toBe('allowed');
  });
});
