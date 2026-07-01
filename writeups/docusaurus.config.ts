import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Security Writeups',
  tagline: 'HTB Sherlocks & LetsDefend',
  favicon: 'img/favicon-terminal.svg',

  url: 'https://param-jasani.github.io',
  baseUrl: '/sec-writeups/',
  
  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'google-site-verification',
        content: 'cEgdu3-GJrjUA4TQDBwpY4yDWjj0d0XHYeLrGvSZOvc',   // ← Replace this
      },
    },
  ],

  organizationName: 'param-jasani',
  projectName: 'sec-writeups',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  stylesheets: [
    'https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@300;400;500;700&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap',
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
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
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Security Writeups',
      logo: {
        alt: 'Logo',
        src: 'img/logo.png',
        style: { display: 'none' }, // Ensure hidden
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'htbSidebar',
          position: 'left',
          label: 'HTB Sherlocks',
        },
        {
          type: 'docSidebar',
          sidebarId: 'letsDefendSidebar',
          position: 'left',
          label: 'LetsDefend',
        },
        {
          type: 'docSidebar',
          sidebarId: 'crackmeSidebar',
          position: 'left',
          label: 'Crackme',
        },
        {
          href: 'https://github.com/param-jasani/',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Writeups',
          items: [
            {
              label: 'HTB Sherlocks',
              to: '/docs/HTB-Sherlocks',
            },
            {
              label: 'LetsDefend',
              to: '/docs/Lets-Defend',
            },
            {
              label: 'Crackme',
              to: '/docs/Crackme',
            },
          ],
        },
        {
          title: 'Socials',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/param-jasani/',
            },
            {
              label: 'LinkedIn',
              href: 'https://www.linkedin.com/in/param-jasani/',
            },
            {
              label: 'Linktree',
              href: 'https://linktr.ee/ParamJasani',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Security Writeups. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
