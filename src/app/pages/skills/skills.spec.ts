import { TestBed } from '@angular/core/testing';

import { Skills } from './skills';

describe('Skills', () => {
  it('shows curated display labels without LinkedIn export noise', async () => {
    await TestBed.configureTestingModule({ imports: [Skills] }).compileComponents();
    const fixture = TestBed.createComponent(Skills);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Python');
    expect(text).toContain('CSS');
    expect(text).not.toContain('Python (Programming Language)');
    expect(text).not.toContain('Cascading Style Sheets (CSS)');
  });

  it('uses the approved concise language proficiency labels', async () => {
    await TestBed.configureTestingModule({ imports: [Skills] }).compileComponents();
    const fixture = TestBed.createComponent(Skills);
    fixture.detectChanges();
    const labels = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.language-card .tag'),
      (element) => element.textContent?.trim(),
    );

    expect(labels).toEqual(['Native', 'Full professional', 'Limited working', 'Limited working']);
  });
});
