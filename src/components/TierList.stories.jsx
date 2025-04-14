import TierList from './TierList';

export default {
  title: 'Components/TierList',
  component: TierList,
  argTypes: {
    setItems: { action: 'setItems' },
    onRemoveItem: { action: 'onRemoveItem' },
  },
};

export const Empty = {
  args: {
    items: {
      storage: [],
      'tier-S': [],
      'tier-A': [],
      'tier-B': [],
      'tier-C': [],
      'tier-D': [],
    },
  },
};

export const WithItems = {
  args: {
    items: {
      storage: [
        { id: '1', content: 'アイテム1', color: '#ff8a8a' },
        { id: '2', content: 'アイテム2', color: '#73c2fb' },
      ],
      'tier-S': [{ id: '3', content: 'Sランク', color: '#ffb347' }],
      'tier-A': [{ id: '4', content: 'Aランク', color: '#b9ff73' }],
      'tier-B': [],
      'tier-C': [],
      'tier-D': [],
    },
  },
};
