import type * as Preset          from '@docusaurus/preset-classic'
import type { Config }           from '@docusaurus/types'

import { themes as prismThemes } from 'prism-react-renderer'

const config: Config = {
  title: 'Last Strategy',
  tagline: 'by Phoenix Games Revolution',
  favicon: 'img/favicon.ico',

  url: 'https://phoenix-games-revolution.github.io',
  baseUrl: 'last-strategy-docs',

  organizationName: 'phoenix-games-revolution',
  projectName: 'last-strategy-docs',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'ru',
    locales: ['ru', 'en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/phoenix-games-revolution/last-strategy-docs/edit/master/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Last Strategy',
      logo: {
        alt: 'Phoenix Games Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://github.com/phoenix-games-revolution/last-strategy-docs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Game Design',
          items: [
            {
              label: 'Об игре',
              to: '/gdd/introduction',
            },
            {
              label: 'Цели',
              to: '/gdd/introduction/objectives',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Phoenix Games Revolution`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
}

export default config
