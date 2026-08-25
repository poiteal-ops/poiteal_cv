import { TestBed } from '@angular/core/testing';

import { Experience } from './experience';

describe('Experience', () => {
  it('renders all earlier roles and expands each row independently', async () => {
    await TestBed.configureTestingModule({ imports: [Experience] }).compileComponents();
    const fixture = TestBed.createComponent(Experience);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const toggles = Array.from(element.querySelectorAll<HTMLButtonElement>('[aria-expanded]'));

    expect(toggles).toHaveLength(7);
    toggles[0]?.click();
    fixture.detectChanges();

    expect(toggles[0]?.getAttribute('aria-expanded')).toBe('true');
    expect(toggles[1]?.getAttribute('aria-expanded')).toBe('false');
    expect(element.querySelector('.accordion-panel')).not.toBeNull();
  });
});
