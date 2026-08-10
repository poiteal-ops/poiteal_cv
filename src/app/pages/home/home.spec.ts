import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Home } from './home';

describe('Home', () => {
  it('shows the profile summary and exactly three recent roles', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('Alain Poitevin');
    expect(element.querySelectorAll('[data-testid="recent-role"]')).toHaveLength(3);
    expect(element.querySelector('img')?.getAttribute('alt')).toBe('Portrait of Alain Poitevin');
  });
});
