import React, { FC } from 'react';
import { Icon, IconName, Tooltip } from '@grafana/ui';
import { sanitize, sanitizeUrl } from '@grafana/data/src/text/sanitize';
import { DashboardLinksDashboard } from './DashboardLinksDashboard';
import { getLinkSrv } from '../../../panel/panellinks/link_srv';

import { DashboardModel } from '../../state';
import { DashboardLink } from '../../state/DashboardModel';
import { iconMap } from '../DashLinks/DashLinksEditorCtrl';
import { appEvents } from 'app/core/app_events';
import { CoreEvents } from 'app/types';

export interface Props {
  dashboard: DashboardModel;
  links: DashboardLink[];
}

export const DashboardLinks: FC<Props> = ({ dashboard, links }) => {
  const videoDetector = 'vimeo:';

  if (!links.length) {
    return null;
  }

  function getVideoId(linkUrl: string) {
    return linkUrl.substring(videoDetector.length, linkUrl.length);
  }

  function checkToDisplayVideo(links: DashboardLink[]) {
    try {
      links.forEach((link: DashboardLink) => {
        if (link.url.startsWith(videoDetector)) {
          let videoId = getVideoId(link.url);

          if (!getCookie('video-' + videoId)) {
            displayModal(link.url, link.title);
          }
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  function displayModal(linkUrl: string, linkTitle: string) {
    let videoId = getVideoId(linkUrl);
    let videoUrl = 'https://player.vimeo.com/video/' + videoId + '?title=0&byline=0&portrait=0';
    appEvents.emit(CoreEvents.showModal, {
      src: 'public/custom/video-popup.html',
      model: {
        id: videoId,
        url: videoUrl,
        title: linkTitle,
      },
      modalClass: 'video',
    });
  }

  function getCookie(cname: string) {
    var name = cname + '=';
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }

  checkToDisplayVideo(links);

  return (
    <>
      {links.map((link: DashboardLink, index: number) => {
        const linkInfo = getLinkSrv().getAnchorInfo(link);
        const key = `${link.title}-$${index}`;

        if (link.type === 'dashboards') {
          return <DashboardLinksDashboard key={key} link={link} linkInfo={linkInfo} dashboardId={dashboard.id} />;
        }

        let linkElement: JSX.Element;
        if (link.url.startsWith(videoDetector)) {
          linkElement = (
            <button className="gf-form-label" onClick={() => displayModal(link.url, link.title)}>
              <Icon name={iconMap[link.icon] as IconName} style={{ marginRight: '4px' }} />
              <span>{sanitize(linkInfo.title)}</span>
            </button>
          );
        } else {
          linkElement = (
            <a
              className="gf-form-label"
              href={sanitizeUrl(linkInfo.href)}
              target={link.targetBlank ? '_blank' : '_self'}
            >
              <Icon name={iconMap[link.icon] as IconName} style={{ marginRight: '4px' }} />
              <span>{sanitize(linkInfo.title)}</span>
            </a>
          );
        }

        return (
          <div key={key} className="gf-form">
            {link.tooltip ? <Tooltip content={link.tooltip}>{linkElement}</Tooltip> : linkElement}
          </div>
        );
      })}
    </>
  );
};
