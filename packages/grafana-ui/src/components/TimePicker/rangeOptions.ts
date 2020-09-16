import { TimeOption } from '@grafana/data';

export const quickOptions: TimeOption[] = [
  { from: 'now-30d', to: 'now', display: 'Les 30 derniers jours', section: 3 },
  { from: 'now-90d', to: 'now', display: 'Les 90 derniers jours', section: 3 },
  { from: 'now-180d', to: 'now', display: 'Les 180 derniers jours', section: 3 },
];

export const otherOptions: TimeOption[] = [
  { from: 'now-1y/y', to: 'now-1y/y', display: "L'année dernière", section: 3 },
  { from: 'now-1M/M', to: 'now-1M/M', display: 'Le mois dernier', section: 3 },
  { from: 'now-1w/w', to: 'now-1w/w', display: 'La semaine dernière', section: 3 },
  { from: 'now-1d/d', to: 'now-1d/d', display: 'Hier', section: 3 },
  { from: 'now/d', to: 'now', display: "Aujourd'hui", section: 3 },
  { from: 'now/w', to: 'now', display: 'Cette semaine', section: 3 },
  { from: 'now/M', to: 'now', display: 'Ce mois', section: 3 },
  { from: 'now/y', to: 'now', display: 'Cette année', section: 3 },
];
