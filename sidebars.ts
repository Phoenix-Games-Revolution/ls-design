import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Game Design Document (GDD)',
      items: [
        'gdd/introduction',
        'gdd/objectives',
      ],
    },
    {
      type: 'category',
      label: 'Technical Design Document (TDD)',
      items: [
        'tdd/index',
      ],
    },
    {
      type: 'category',
      label: 'World Bible',
      items: [
        'world-bible/index',
      ],
    },
  ],
};

export default sidebars;
