import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Game Design Document',
      items: [
        {
          type: 'category',
          label: 'Введение',
          items: ['gdd/introduction/introduction', 'gdd/introduction/objectives'],
        },
        {
          type: 'category',
          label: 'Обзор',
          items: ['gdd/overview/concept'],
        }
      ],
    },
    {
      type: 'category',
      label: 'Technical Design Document',
      items: ['tdd/index'],
    },
    {
      type: 'category',
      label: 'World Bible',
      items: ['world-bible/index'],
    },
  ],
}

export default sidebars
