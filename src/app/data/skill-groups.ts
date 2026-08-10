import { SkillGroupName } from './cv.types';

export const SKILL_GROUP_ORDER: readonly SkillGroupName[] = [
  'Data & delivery',
  'Development',
  'Databases & systems',
];

export const SKILL_GROUPS: Record<SkillGroupName, readonly string[]> = {
  'Data & delivery': [
    'Data Quality',
    'Quality Assurance Management',
    'Business Intelligence Reporting',
    'Qlik Sense Enterprise',
    'Qlik Sense',
    'Project Management',
    'Agile Methodologies',
    'Scrum',
    'Kanban',
    'Jira',
    'UML',
  ],
  Development: [
    'Python (Programming Language)',
    'Java',
    'PHP',
    'ColdFusion',
    'JavaScript',
    'jQuery',
    'AJAX',
    'HTML',
    'Cascading Style Sheets (CSS)',
    'XML',
    'REST',
    'Web Services',
    'Web Applications',
    'Web Development',
    'Software Development',
    'Programming',
    'Eclipse',
    'Tomcat',
    'IIS',
    'Subversion',
  ],
  'Databases & systems': [
    'Oracle',
    'Oracle SQL',
    'PL/SQL',
    'SQL',
    'Databases',
    'Database Design',
    'MySQL',
    'Microsoft SQL Server',
  ],
};

export const SKILL_DISPLAY_LABELS: Readonly<Record<string, string>> = {
  'Python (Programming Language)': 'Python',
  'Cascading Style Sheets (CSS)': 'CSS',
};
