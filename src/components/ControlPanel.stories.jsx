import ControlPanel from './ControlPanel';

export default {
  title: 'Components/ControlPanel',
  component: ControlPanel,
  argTypes: {
    onAddItem: { action: 'onAddItem' },
    onClearAll: { action: 'onClearAll' },
    onRemoveItem: { action: 'onRemoveItem' },
    getShareableState: {
      control: 'function',
      description: 'Returns the current state as a shareable string',
    },
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'コントロールパネルコンポーネント。アイテムの追加、削除、画像保存、シェア機能を提供します。',
      },
    },
  },
};

const mockGetShareableState = () => {
  return JSON.stringify({
    storage: [{ id: 'Item 1', content: 'Item 1', color: '#ff8a8a' }],
    'tier-S': [{ id: 'Item 2', content: 'Item 2', color: '#ffb347' }],
    'tier-A': [],
    'tier-B': [],
    'tier-C': [],
    'tier-D': [],
  });
};

export const Default = {
  args: {
    getShareableState: mockGetShareableState,
  },
};

export const WithAddItemModalOpen = {
  args: {
    getShareableState: mockGetShareableState,
  },
  parameters: {
    docs: {
      description: {
        story: 'アイテム追加モーダルが開いた状態',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const addButton = canvasElement.querySelector('button:nth-child(1)');
    if (addButton) {
      addButton.click();
    }
  },
};

export const WithShareModalOpen = {
  args: {
    getShareableState: mockGetShareableState,
  },
  parameters: {
    docs: {
      description: {
        story: 'シェアモーダルが開いた状態',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const shareButton = canvasElement.querySelector('button:nth-child(4)');
    if (shareButton) {
      shareButton.click();
    }
  },
};
