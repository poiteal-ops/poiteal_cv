import { Component, inject, signal } from '@angular/core';

import { Experience as ExperienceRecord } from '../../data/cv.types';
import { CvDataService } from '../../services/cv-data.service';
import { BlueprintFrame } from '../../shared/blueprint-frame/blueprint-frame';

@Component({
  selector: 'app-experience',
  imports: [BlueprintFrame],
  templateUrl: './experience.html',
  styleUrl: './experience.scss',
})
export class Experience {
  private readonly cvData = inject(CvDataService);

  protected readonly recentExperiences = this.cvData.recentExperiences();
  protected readonly earlierExperiences = this.cvData.earlierExperiences();
  protected readonly expandedKeys = signal<Set<string>>(new Set());

  protected experienceKey(experience: ExperienceRecord): string {
    return `${experience.title}__${experience.start}`;
  }

  protected toggle(experience: ExperienceRecord): void {
    const key = this.experienceKey(experience);
    this.expandedKeys.update((expanded) => {
      const next = new Set(expanded);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }
}
