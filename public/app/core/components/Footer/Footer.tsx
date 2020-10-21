import React, { FC } from 'react';
import { config } from 'app/core/config';
import { Icon, IconName } from '@grafana/ui';

export interface FooterLink {
  text: string;
  icon?: string;
  url?: string;
  target?: string;
}

export let getFooterLinks = (): FooterLink[] => {
  const { isCollabInstance } = config;
  const { isGrafanaAdmin } = config.bootData.user;
  const links: FooterLink[] = [];

  links.push({
    text: 'Prise de main',
    icon: 'life-ring',
    url: 'https://get.teamviewer.com/moncockpit_support',
    target: '_blank',
  });
  if (!isCollabInstance || isGrafanaAdmin) {
    links.push(
      {
        text: 'Planifier rendez-vous',
        icon: 'schedule',
        url: 'https://www.mon-cockpit.fr/planifier-rendez-vous/',
        target: '_blank',
      },
      {
        text: "Guide d'utilisation",
        icon: 'book-alt',
        url: 'https://vpa.mon-cockpit.fr/public/Guide_de_prise_en_main.pdf',
        target: '_blank',
      },
      {
        text: 'Mon Compte',
        icon: 'user-circle',
        url: 'https://www.mon-cockpit.fr/mon_compte/',
        target: '_blank',
      }
    );
  }

  return links;
};

export let getVersionLinks = (): FooterLink[] => {
  const { buildInfo, licenseInfo } = config;
  const links: FooterLink[] = [];
  const stateInfo = licenseInfo.stateInfo ? ` (${licenseInfo.stateInfo})` : '';

  links.push({ text: `${buildInfo.edition}${stateInfo}`, url: licenseInfo.licenseUrl });

  if (buildInfo.hideVersion) {
    return links;
  }

  links.push({ text: `v${buildInfo.version} (${buildInfo.commit})` });

  if (buildInfo.hasUpdate) {
    links.push({
      text: `New version available!`,
      icon: 'download-alt',
      url: 'https://grafana.com/grafana/download?utm_source=grafana_footer',
      target: '_blank',
    });
  }

  return links;
};

export function setFooterLinksFn(fn: typeof getFooterLinks) {
  getFooterLinks = fn;
}

export function setVersionLinkFn(fn: typeof getFooterLinks) {
  getVersionLinks = fn;
}

export const Footer: FC = React.memo(() => {
  const links = getFooterLinks().concat(getVersionLinks());

  return (
    <footer className="footer">
      <div className="text-center">
        <ul>
          {links.map(link => (
            <li key={link.text}>
              <a href={link.url} target={link.target} rel="noopener">
                <Icon name={link.icon as IconName} /> {link.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
});
