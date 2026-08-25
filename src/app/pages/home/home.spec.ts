import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Home } from './home';

describe('Home', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.removeItem('github-content-consent');
  });

  it('shows the profile summary and exactly three recent roles', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('Alain Poitevin');
    expect(element.querySelectorAll('[data-testid="recent-role"]')).toHaveLength(3);
    expect(element.querySelector('img')?.getAttribute('alt')).toBe('Portrait of Alain Poitevin');

    const downloadLink = element.querySelector<HTMLAnchorElement>('a[download]');
    expect(downloadLink?.getAttribute('href')).toBe(
      'documents/Alain_Poitevin_CV_EU_Consulting_Detailed.pdf',
    );
    expect(downloadLink?.hasAttribute('download')).toBe(true);

    const recentSection = element.querySelector('.recent');
    const projectsSection = element.querySelector('app-github-projects');

    expect(recentSection).not.toBeNull();
    expect(projectsSection).not.toBeNull();
    expect(
      recentSection!.compareDocumentPosition(projectsSection!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
