import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CvDataService } from '../../services/cv-data.service';
import { BlueprintFrame } from '../../shared/blueprint-frame/blueprint-frame';

@Component({
  selector: 'app-home',
  imports: [BlueprintFrame, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly cvData = inject(CvDataService);

  protected readonly profile = this.cvData.profile;
  protected readonly recentExperiences = this.cvData.recentExperiences();
}
