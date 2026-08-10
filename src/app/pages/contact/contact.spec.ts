import { TestBed } from '@angular/core/testing';

import { Contact } from './contact';

describe('Contact', () => {
  it('renders safe email, phone, and external LinkedIn links', async () => {
    await TestBed.configureTestingModule({ imports: [Contact] }).compileComponents();
    const fixture = TestBed.createComponent(Contact);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector<HTMLAnchorElement>('a[href^="mailto:"]')?.href).toContain(
      'poiteal@gmail.com',
    );
    expect(element.querySelector<HTMLAnchorElement>('a[href^="tel:"]')?.getAttribute('href')).toBe(
      'tel:+32491256526',
    );
    expect(element.querySelector<HTMLAnchorElement>('a[target="_blank"]')?.rel).toContain('noopener');
  });
});
