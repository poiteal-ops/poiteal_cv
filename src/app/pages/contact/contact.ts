import { Component, inject } from '@angular/core';

import { CvDataService } from '../../services/cv-data.service';
import { BlueprintFrame } from '../../shared/blueprint-frame/blueprint-frame';

@Component({
  selector: 'app-contact',
  imports: [BlueprintFrame],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  private readonly cvData = inject(CvDataService);

  protected readonly contact = this.cvData.contact;
  protected readonly profile = this.cvData.profile;
}
