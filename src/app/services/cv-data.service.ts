import { Injectable } from '@angular/core';

import contactData from '../data/contact.json';
import profileData from '../data/profile.json';
import {
  Contact,
  Experience,
  Profile,
  SkillGroup,
} from '../data/cv.types';
import {
  SKILL_DISPLAY_LABELS,
  SKILL_GROUP_ORDER,
  SKILL_GROUPS,
} from '../data/skill-groups';

@Injectable({ providedIn: 'root' })
export class CvDataService {
  readonly profile: Profile = profileData;
  readonly contact: Contact = contactData;

  recentExperiences(): Experience[] {
    return this.profile.experiences.slice(0, 3);
  }

  earlierExperiences(): Experience[] {
    return this.profile.experiences.slice(3);
  }

  skillGroups(): SkillGroup[] {
    return SKILL_GROUP_ORDER.map((name) => ({
      name,
      skills: SKILL_GROUPS[name].map((value) => ({
        value,
        label: SKILL_DISPLAY_LABELS[value] ?? value,
      })),
    }));
  }
}
