import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { GithubProject } from '../../data/github-project';
import { GithubConsentService } from '../../services/github-consent.service';
import { GithubProjectsService } from '../../services/github-projects.service';
import { GithubProjects } from './github-projects';

const DISCLAIMER =
  'These are personal projects only. Work completed under contract is confidential and is not represented here.';

const cachedProjects: readonly GithubProject[] = [
  {
    name: 'Cached project',
    description: 'Saved description',
    url: 'https://github.com/poiteal-ops/cached-project',
    language: 'TypeScript',
    updatedAt: '2026-08-01T12:00:00Z',
  },
];

const liveProject: GithubProject = {
  name: 'Live project',
  description: 'Live description',
  url: 'https://github.com/poiteal-ops/live-project',
  language: 'Python',
  updatedAt: '2026-08-09T12:00:00Z',
};

class GithubProjectsServiceStub {
  readonly cachedProjects: readonly GithubProject[];

  constructor(cachedProjectData: readonly GithubProject[] = cachedProjects) {
    this.cachedProjects = cachedProjectData;
  }

  readonly response = new Subject<readonly GithubProject[]>();
  readonly loadLiveProjects = vi.fn(() => this.response.asObservable());
}

describe('GithubProjects', () => {
  let projectsService: GithubProjectsServiceStub;

  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    projectsService = new GithubProjectsServiceStub();
  });

  function createComponent() {
    TestBed.configureTestingModule({
      imports: [GithubProjects],
      providers: [{ provide: GithubProjectsService, useValue: projectsService }],
    });

    const fixture = TestBed.createComponent(GithubProjects);
    fixture.detectChanges();
    return fixture;
  }

  function projectNames(element: HTMLElement): string[] {
    return [...element.querySelectorAll('[data-testid="github-project"] .project-name')].map(
      (node) => node.textContent?.trim() ?? '',
    );
  }

  function statusText(element: HTMLElement): string {
    return element.querySelector('[data-testid="github-projects-status"]')?.textContent?.trim() ?? '';
  }

  function expectDisclaimer(element: HTMLElement): void {
    expect(element.textContent).toContain(DISCLAIMER);
  }

  it('shows cached projects without requesting GitHub while consent is unknown', () => {
    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;

    expect(projectsService.loadLiveProjects).toHaveBeenCalledTimes(0);
    expect(projectNames(element)).toEqual(['Cached project']);
    expect(statusText(element)).toBe('Showing saved project information.');
    expectDisclaimer(element);
  });

  it('shows the saved empty state without requesting GitHub when the cache is empty', () => {
    projectsService = new GithubProjectsServiceStub([]);
    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;
    const profileLink = [...element.querySelectorAll<HTMLAnchorElement>('a')].find(
      (link) => link.textContent?.trim() === 'View GitHub profile',
    );

    expect(projectsService.loadLiveProjects).toHaveBeenCalledTimes(0);
    expect(projectNames(element)).toEqual([]);
    expect(statusText(element)).toBe('Showing saved project information.');
    expect(profileLink?.href).toBe('https://github.com/poiteal-ops');
    expect(profileLink?.rel).toBe('noopener noreferrer');
    expectDisclaimer(element);
  });

  it('shows cached projects without requesting GitHub after consent is declined', () => {
    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;

    TestBed.inject(GithubConsentService).decline();
    fixture.detectChanges();

    expect(projectsService.loadLiveProjects).toHaveBeenCalledTimes(0);
    expect(projectNames(element)).toEqual(['Cached project']);
    expect(statusText(element)).toBe(
      'GitHub connection declined. Showing saved project information.',
    );
    expectDisclaimer(element);
  });

  it('keeps cached projects visible while an allowed GitHub request is pending', () => {
    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;

    TestBed.inject(GithubConsentService).allow();
    fixture.detectChanges();

    expect(projectsService.loadLiveProjects).toHaveBeenCalledTimes(1);
    expect(projectNames(element)).toEqual(['Cached project']);
    expect(statusText(element)).toBe('Refreshing project information from GitHub...');
    expectDisclaimer(element);
  });

  it('replaces cached projects with live projects after a successful request', () => {
    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;

    TestBed.inject(GithubConsentService).allow();
    fixture.detectChanges();
    projectsService.response.next([liveProject]);
    fixture.detectChanges();

    expect(projectsService.loadLiveProjects).toHaveBeenCalledTimes(1);
    expect(projectNames(element)).toEqual(['Live project']);
    expect(statusText(element)).toBe('Showing live project information from GitHub.');
    expectDisclaimer(element);
  });

  it('shows the empty message when an allowed request has no public projects', () => {
    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;

    TestBed.inject(GithubConsentService).allow();
    fixture.detectChanges();
    projectsService.response.next([]);
    fixture.detectChanges();

    expect(projectsService.loadLiveProjects).toHaveBeenCalledTimes(1);
    expect(projectNames(element)).toEqual([]);
    expect(statusText(element)).toBe('Showing live project information from GitHub.');
    expect(
      element.querySelector('[data-testid="github-projects-empty"]')?.textContent?.trim(),
    ).toBe('No public projects are available right now.');
    expectDisclaimer(element);
  });

  it('presents the projects heading as a compact section kicker', () => {
    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;
    const heading = element.querySelector<HTMLElement>('#github-projects-title');
    const projectTitle = element.querySelector<HTMLElement>('.project-name');
    const headingStyles = getComputedStyle(heading!);
    const projectTitleStyles = getComputedStyle(projectTitle!);

    expect(heading?.tagName).toBe('H2');
    expect(heading?.textContent?.trim()).toBe('Public projects');
    expect(headingStyles.fontSize).toBe('13px');
    expect(headingStyles.textTransform).toBe('uppercase');
    expect(Number.parseFloat(headingStyles.fontSize)).toBeLessThan(
      Number.parseFloat(projectTitleStyles.fontSize),
    );
  });

  it('restores cached projects when an allowed request fails', () => {
    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;

    TestBed.inject(GithubConsentService).allow();
    fixture.detectChanges();
    projectsService.response.error(new Error('network unavailable'));
    fixture.detectChanges();

    expect(projectsService.loadLiveProjects).toHaveBeenCalledTimes(1);
    expect(projectNames(element)).toEqual(['Cached project']);
    expect(statusText(element)).toBe(
      'GitHub is currently unavailable. Showing saved project information.',
    );
    expectDisclaimer(element);
  });

  it('ignores an in-flight response after allowed consent changes to declined', () => {
    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;
    const consent = TestBed.inject(GithubConsentService);

    consent.allow();
    fixture.detectChanges();
    consent.decline();
    fixture.detectChanges();
    projectsService.response.next([liveProject]);
    fixture.detectChanges();

    expect(projectsService.loadLiveProjects).toHaveBeenCalledTimes(1);
    expect(projectNames(element)).toEqual(['Cached project']);
    expect(statusText(element)).toBe(
      'GitHub connection declined. Showing saved project information.',
    );
    expectDisclaimer(element);
  });

  it('starts one request immediately when declined consent changes to allowed', () => {
    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;
    const consent = TestBed.inject(GithubConsentService);

    consent.decline();
    fixture.detectChanges();
    consent.allow();
    fixture.detectChanges();

    expect(projectsService.loadLiveProjects).toHaveBeenCalledTimes(1);
    expect(statusText(element)).toBe('Refreshing project information from GitHub...');
    expectDisclaimer(element);
  });

  it('uses the description fallback and omits a missing language tag', () => {
    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;

    TestBed.inject(GithubConsentService).allow();
    fixture.detectChanges();
    projectsService.response.next([{ ...liveProject, description: null, language: null }]);
    fixture.detectChanges();

    const card = element.querySelector('[data-testid="github-project"]');
    expect(card?.textContent).toContain('No description provided.');
    expect(card?.querySelector('.project-language')).toBeNull();
  });

  it('renders repository and profile links with safe external-link attributes', () => {
    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;
    const links = [...element.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]')];
    const repositoryLink = links.find((link) => link.textContent?.trim() === 'View repository');
    const profileLink = links.find((link) => link.textContent?.trim() === 'View GitHub profile');

    expect(repositoryLink?.href).toBe('https://github.com/poiteal-ops/cached-project');
    expect(repositoryLink?.rel).toBe('noopener noreferrer');
    expect(profileLink?.href).toBe('https://github.com/poiteal-ops');
    expect(profileLink?.rel).toBe('noopener noreferrer');
  });

  it('renders API strings as text rather than executable markup', () => {
    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;
    const maliciousText = '<img src=x onerror=alert(1)>';

    TestBed.inject(GithubConsentService).allow();
    fixture.detectChanges();
    projectsService.response.next([{ ...liveProject, name: maliciousText }]);
    fixture.detectChanges();

    const card = element.querySelector('[data-testid="github-project"]');
    expect(card?.textContent).toContain(maliciousText);
    expect(card?.querySelector('img')).toBeNull();
  });
});
