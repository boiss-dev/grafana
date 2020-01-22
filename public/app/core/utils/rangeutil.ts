import _ from 'lodash';
import moment from 'moment';

import { RawTimeRange } from 'app/types/series';

import * as dateMath from './datemath';

const spans = {
  s: { display: 'second' },
  m: { display: 'minute' },
  h: { display: 'hour' },
  d: { display: 'day' },
  w: { display: 'week' },
  M: { display: 'month' },
  y: { display: 'year' },
};

const rangeOptions = [
  { from: 'now/d', to: 'now/d', display: "Aujourd'hui", section: 3 },
  { from: 'now-1d/d', to: 'now-1d/d', display: '...1 jour', section: 3 },
  { from: 'now-2d/d', to: 'now-2d/d', display: '...2 jours', section: 3 },
  { from: 'now-3d/d', to: 'now-3d/d', display: '...3 jours', section: 3 },
  { from: 'now-4d/d', to: 'now-4d/d', display: '...4 jours', section: 3 },
  { from: 'now-5d/d', to: 'now-5d/d', display: '...5 jours', section: 3 },
  { from: 'now-6d/d', to: 'now-6d/d', display: '...6 jours', section: 3 },
  { from: 'now-7d/d', to: 'now-7d/d', display: '...1 semaine', section: 2 },
  { from: 'now-14d/d', to: 'now-14d/d', display: '...2 semaines', section: 2 },
  { from: 'now-21d/d', to: 'now-21d/d', display: '...3 semaines', section: 2 },
  { from: 'now-28d/d', to: 'now-28d/d', display: '...4 semaines', section: 2 },
  { from: 'now-1M/d', to: 'now-1M', display: '...1 mois', section: 1 },
  { from: 'now-2M/d', to: 'now-2M', display: '...2 mois', section: 1 },
  { from: 'now-3M/d', to: 'now-3M', display: '...3 mois', section: 1 },
  { from: 'now-4M/d', to: 'now-4M', display: '...4 mois', section: 1 },
  { from: 'now-5M/d', to: 'now-5M', display: '...5 mois', section: 1 },
  { from: 'now-6M/d', to: 'now-6M', display: '...6 mois', section: 1 },
  { from: 'now-9M/d', to: 'now-9M', display: '...9 mois', section: 1 },
  { from: 'now-1y/d', to: 'now-1y/d', display: '...1 an', section: 0 },
  { from: 'now-2y/d', to: 'now-2y/d', display: '...2 ans', section: 0 },
  { from: 'now-3y/d', to: 'now-3y/d', display: '...3 ans', section: 0 },
  { from: 'now-4y/d', to: 'now-4y/d', display: '...4 ans', section: 0 },
  { from: 'now/y', to: 'now', display: 'Depuis le 1er Janvier', section: 4 },
  { from: 'now-1y/y', to: 'now-1y/y', display: 'L’année dernière', section: 4 },
  { from: 'now-6M', to: 'now', display: 'Les 6 derniers mois', section: 4 },
  { from: 'now/M', to: 'now', display: 'Ce mois', section: 4 },
  { from: 'now', to: 'now', display: 'Depuis le début', section: 4 },
];

const absoluteFormat = 'MMM D, YYYY HH:mm:ss';

const rangeIndex = {};
_.each(rangeOptions, frame => {
  rangeIndex[frame.from + ' to ' + frame.to] = frame;
});

export function getRelativeTimesList(timepickerSettings, currentDisplay) {
  if (timepickerSettings.option) {
    const installationDateOption = rangeOptions.find(obj => {
      return obj.display === timepickerSettings.option;
    })
    if (installationDateOption) {
      if (timepickerSettings.installationDate) {
        installationDateOption.from = timepickerSettings.installationDate;
      } else {
        const rangeOptionIndex = rangeOptions.indexOf(installationDateOption);
        if (rangeOptionIndex > -1) {
          rangeOptions.splice(rangeOptionIndex, 1);
        }
      }
    }
  }

  const groups = _.groupBy(rangeOptions, (option: any) => {
    option.active = option.display === currentDisplay;
    return option.section;
  });

  // _.each(timepickerSettings.time_options, (duration: string) => {
  //   let info = describeTextRange(duration);
  //   if (info.section) {
  //     groups[info.section].push(info);
  //   }
  // });

  return groups;
}

function formatDate(date) {
  return date.format(absoluteFormat);
}

// handles expressions like
// 5m
// 5m to now/d
// now/d to now
// now/d
// if no to <expr> then to now is assumed
export function describeTextRange(expr: any) {
  const isLast = expr.indexOf('+') !== 0;
  if (expr.indexOf('now') === -1) {
    expr = (isLast ? 'now-' : 'now') + expr;
  }

  let opt = rangeIndex[expr + ' to now'];
  if (opt) {
    return opt;
  }

  if (isLast) {
    opt = { from: expr, to: 'now' };
  } else {
    opt = { from: 'now', to: expr };
  }

  const parts = /^now([-+])(\d+)(\w)/.exec(expr);
  if (parts) {
    const unit = parts[3];
    const amount = parseInt(parts[2], 10);
    const span = spans[unit];
    if (span) {
      opt.display = isLast ? 'Last ' : 'Next ';
      opt.display += amount + ' ' + span.display;
      opt.section = span.section;
      if (amount > 1) {
        opt.display += 's';
      }
    }
  } else {
    opt.display = opt.from + ' to ' + opt.to;
    opt.invalid = true;
  }

  return opt;
}

export function describeTimeRange(range: RawTimeRange): string {
  const option = rangeIndex[range.from.toString() + ' to ' + range.to.toString()];
  if (option) {
    return option.display;
  }

  if (moment.isMoment(range.from) && moment.isMoment(range.to)) {
    return formatDate(range.from) + ' to ' + formatDate(range.to);
  }

  if (moment.isMoment(range.from)) {
    const toMoment = dateMath.parse(range.to, true);
    return formatDate(range.from) + ' to ' + toMoment.fromNow();
  }

  if (moment.isMoment(range.to)) {
    const from = dateMath.parse(range.from, false);
    return from.fromNow() + ' to ' + formatDate(range.to);
  }

  if (range.to.toString() === 'now') {
    const res = describeTextRange(range.from);
    return res.display;
  }

  return range.from.toString() + ' to ' + range.to.toString();
}
