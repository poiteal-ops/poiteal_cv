import { CvDataService } from './cv-data.service';

describe('CvDataService', () => {
  const service = new CvDataService();

  it('separates the three recent roles from all eleven earlier roles', () => {
    expect(service.recentExperiences()).toHaveLength(3);
    expect(service.recentExperiences()[0]?.title).toBe('Data Quality Lead');
    expect(service.earlierExperiences()).toHaveLength(11);
  });

  it('uses the current job titles from the exported profile', () => {
    const engineeringRoles = service.profile.experiences.filter(
      (experience) => experience.employer === 'Engineering Ingegneria Informatica Spa',
    );

    expect(engineeringRoles.find((experience) => experience.start === '2015-01')?.title).toBe(
      'Developer',
    );
    expect(engineeringRoles.find((experience) => experience.start === '2013-12')?.title).toBe(
      'Developer',
    );
  });

  it('keeps curated skill values tied to the authoritative profile data', () => {
    const groupedSkills = service.skillGroups().flatMap((group) => group.skills);
    const values = groupedSkills.map((skill) => skill.value);

    expect(values).toContain('Python (Programming Language)');
    expect(values).toContain('Cascading Style Sheets (CSS)');
    expect(values).not.toContain('French');
    expect(groupedSkills.every((skill) => service.profile.skills.includes(skill.value))).toBe(true);
  });

  it('shortens only the display labels exported verbosely by LinkedIn', () => {
    const groupedSkills = service.skillGroups().flatMap((group) => group.skills);

    expect(groupedSkills.find((skill) => skill.value === 'Python (Programming Language)')?.label).toBe(
      'Python',
    );
    expect(groupedSkills.find((skill) => skill.value === 'Cascading Style Sheets (CSS)')?.label).toBe(
      'CSS',
    );
  });
});
