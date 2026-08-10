export interface Experience {
  title: string;
  employer: string;
  start: string;
  end: string;
  location: string;
  employment_type: string;
  client_context: string;
  bullets: string[];
  technical_environment: string[];
}

export interface Language {
  name: string;
  proficiency: string;
}

export interface Profile {
  name: string;
  headline: string;
  location: string;
  linkedin_url: string;
  experiences: Experience[];
  languages: Language[];
  skills: string[];
}

export interface Contact {
  email: string;
  phone_display: string;
  phone_uri: string;
}

export type SkillGroupName = 'Data & delivery' | 'Development' | 'Databases & systems';

export interface DisplaySkill {
  value: string;
  label: string;
}

export interface SkillGroup {
  name: SkillGroupName;
  skills: DisplaySkill[];
}
