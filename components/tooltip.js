'use babel';

import { el, mount, setAttr } from 'redom';
import format from 'date-fns/format';
import map from 'lodash/map';

import {
  NPM_LIBRARY_DESCRIPTION,
  TOOLTIP,
  DATE_FORMAT,
  MIN_HEIGHT,
} from '../constants/elements';

const getView = atom => atom.views.getView(atom.workspace);

export const removeTooltip = (badge, data) => {
  badge.querySelector(`.${TOOLTIP}.${data.name}`).remove();
};

export const removeTooltips = (atom) => {
  const target = `body /deep/ .${NPM_LIBRARY_DESCRIPTION} .${TOOLTIP}`;
  const tooltips = getView(atom).querySelectorAll(target);
  map(tooltips, (tooltip) => {
    tooltip.remove();
  });
};

const addLatestVersion = (data) => {
  const version = data['dist-tags'];
  if (!version || !version.latest) {
    return el('p', 'No latest version');
  }

  return el('p',
    el('strong', 'Latest version:'),
    el('span', ` ${version.latest}`),
  );
};

const addReleaseDate = (data) => {
  const version = data['dist-tags'];
  if (!version || !version.latest) {
    return undefined;
  }

  return el('p',
    el('strong', 'Release date:'),
    el('span', ` ${format(data.time[version.latest], DATE_FORMAT)}`),
  );
};

const addAuthor = (data) => {
  if (!data || !data.author || !data.author.name) {
    return undefined;
  }

  return el('p',
    el('strong', 'Author:'),
    el('span', ` ${data.author.name}`),
  );
};

const addWebsiteLink = (data) => {
  if (!data || !data.homepage) {
    return undefined;
  }

  const icon = el('i');
  setAttr(icon, {
    className: 'icon icon-globe',
  });

  const homepage = el('a', icon);
  setAttr(homepage, {
    className: 'btn',
    href: data.homepage,
    title: data.homepage,
  });

  return homepage;
};

const addNpmLink = (data) => {
  if (!data || !data.name) {
    return undefined;
  }
  const npmlink = `https://npmjs.com/packages/${data.name}`;

  const icon = el('i');
  setAttr(icon, {
    className: 'icon icon-repo',
  });

  const npm = el('a', icon);
  setAttr(npm, {
    className: 'btn btn-primary',
    href: npmlink,
    title: npmlink,
  });

  return npm;
};

// Checks if the tooltip should be opened up or down depending on the badge's position relative to
// the screen.
const shouldOpenOnBottom = pixelsToBottom => pixelsToBottom >= MIN_HEIGHT;

const addFooter = (data) => {
  const infoContainer = el(
    'div',
    el('small', addLatestVersion(data)),
    el('small', addReleaseDate(data)),
    el('small', addAuthor(data)),
  );
  setAttr(infoContainer, {
    className: data && data.homepage ? 'info' : 'info incomplete',
  });

  const footer = el('footer',
    infoContainer,
    addWebsiteLink(data),
    addNpmLink(data),
  );

  return footer;
};

const addCloseButton = (data, badge) => {
  const icon = el('i');
  setAttr(icon, {
    className: 'close icon icon-x',
  });

  icon.addEventListener('click', () => {
    removeTooltip(badge, data);
  }, false);

  return icon;
};

export const addTooltip = ({ dependency, pixelsToBottom }, element) => {
  const { data } = dependency;

  const tooltip = el('div',
    addCloseButton(data, element),
    el('article',
      el('h3', data.name),
      el('p', data.description),
    ),
    addFooter(data),
  );

  const positionClass = shouldOpenOnBottom(pixelsToBottom) ? 'bottom' : 'top';

  setAttr(tooltip, {
    className: `${TOOLTIP} ${data.name} ${positionClass}`,
  });

  mount(element, tooltip);
};
