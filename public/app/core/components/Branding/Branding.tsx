import React, { FC } from 'react';
import { css } from 'emotion';
import { useTheme } from '@grafana/ui';
import { config } from 'app/core/config';

export interface BrandComponentProps {
  className?: string;
  children?: JSX.Element | JSX.Element[];
}

const LoginLogo: FC<BrandComponentProps> = ({ className }) => {
  return <img className={className} src="public/custom/allianz-icon.svg" alt="Mon-Cockpit" />;
};

const LoginBackground: FC<BrandComponentProps> = ({ className, children }) => {
  return <div className={className}>{children}</div>;
};

const MenuLogo: FC<BrandComponentProps> = ({ className }) => {
  return <img className={className} src="public/custom/allianz-icon.svg" alt="Mon-Cockpit" />;
};

const LoginBoxBackground = () => {
  const theme = useTheme();
  return css`
    background: ${theme.isLight ? 'rgba(6, 30, 200, 0.1 )' : 'rgba(18, 28, 41, 0.65)'};
    background-size: cover;
  `;
};

const LoginTitle = () => {
  const { isCollabInstance } = config;
  return `Bienvenue sur Mon-Cockpit ${isCollabInstance ? 'pour les collaborateurs' : ''}`;
};

export class Branding {
  static LoginLogo = LoginLogo;
  static LoginBackground = LoginBackground;
  static MenuLogo = MenuLogo;
  static LoginBoxBackground = LoginBoxBackground;
  static AppTitle = 'Mon-Cockpit';
  static LoginTitle = LoginTitle;
  static GetLoginSubTitle = () => {
    const slogans = [
      "Don't get in the way of the data",
      'Your single pane of glass',
      'Built better together',
      'Democratising data',
    ];
    const count = slogans.length;
    return slogans[Math.floor(Math.random() * count)];
  };
}
