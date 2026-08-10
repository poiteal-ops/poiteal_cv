import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    localStorage.setItem('cv-theme', 'light');
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('renders the shared navigation and footer around routed content', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('nav')?.textContent).toContain('Experience');
    expect(
      element
        .querySelector<HTMLAnchorElement>('.nav-links a[href="/"]')
        ?.getAttribute('aria-current'),
    ).toBe('page');
    expect(element.querySelector('footer')?.textContent).toContain('© 2026 Alain Poitevin');
    expect(element.querySelector('main h1')?.textContent).toContain('Alain Poitevin');
  });
});
