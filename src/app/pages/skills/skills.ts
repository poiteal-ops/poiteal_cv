import { Component, inject } from '@angular/core';

import { CvDataService } from '../../services/cv-data.service';
import { BlueprintFrame } from '../../shared/blueprint-frame/blueprint-frame';

@Component({
  selector: 'app-skills',
  imports: [BlueprintFrame],
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
})
export class Skills {
  private readonly cvData = inject(CvDataService);
  private readonly languageDisplayLabels: Readonly<Record<string, string>> = {
    'Native or bilingual proficiency': 'Native',
    'Full professional proficiency': 'Full professional',
    'Limited working proficiency': 'Limited working',
  };

  protected readonly skillGroups = this.cvData.skillGroups();
  protected readonly languages = this.cvData.profile.languages;

  protected proficiencyLabel(proficiency: string): string {
    return this.languageDisplayLabels[proficiency] ?? proficiency;
  }
}
