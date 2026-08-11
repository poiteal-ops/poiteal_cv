import { TestBed } from '@angular/core/testing';

import { Contact } from './contact';

describe('Contact', () => {
  it('renders safe email and external LinkedIn links', async () => {
    await TestBed.configureTestingModule({ imports: [Contact] }).compileComponents();
    const fixture = TestBed.createComponent(Contact);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector<HTMLAnchorElement>('a[href^="mailto:"]')?.href).toContain(
      'poiteal@gmail.com',
    );
    expect(element.querySelector<HTMLAnchorElement>('a[target="_blank"]')?.rel).toContain('noopener');
  });

  it('does not expose phone contact details', async () => {
    await TestBed.configureTestingModule({ imports: [Contact] }).compileComponents();
    const fixture = TestBed.createComponent(Contact);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('a[href^="tel:"]')).toBeNull();
    expect(element.textContent).not.toContain('Phone');
  });

  it('offers the CV PDF as a download', async () => {
    await TestBed.configureTestingModule({ imports: [Contact] }).compileComponents();
    const fixture = TestBed.createComponent(Contact);
    fixture.detectChanges();
    const downloadLink = fixture.nativeElement.querySelector(
      'a[download]',
    ) as HTMLAnchorElement | null;

    expect(downloadLink?.getAttribute('href')).toBe(
      'documents/Alain_Poitevin_CV_Data_Quality_Lead.pdf',
    );
    expect(downloadLink?.textContent).toContain('Download CV (PDF)');
  });
});
