import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then((module) => module.Home) },
  {
    path: 'experience',
    loadComponent: () => import('./pages/experience/experience').then((module) => module.Experience),
  },
  {
    path: 'skills',
    loadComponent: () => import('./pages/skills/skills').then((module) => module.Skills),
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((module) => module.Contact),
  },
  { path: '**', redirectTo: '' },
];
