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

const mockGetShareableState = (includeImages = false) => {
  const mockImageBase64 =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

  return includeImages
    ? JSON.stringify({
        storage: [
          {
            id: '1',
            content: 'Item 1',
            type: 'text',
            color: '#ff8a8a',
          },
          {
            id: '2',
            content: mockImageBase64,
            type: 'image',
            color: '#ffb347',
            originalContent: mockImageBase64,
          },
        ],
        'tier-S': [],
        'tier-A': [],
        'tier-B': [],
        'tier-C': [],
        'tier-D': [],
      })
    : 'mock-local-storage-key';
};

export const Default = {
  args: {
    getShareableState: () => mockGetShareableState(false),
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
    getShareableState: () => mockGetShareableState(false),
  },
  parameters: {
    docs: {
      description: {
        story: 'シェアモーダルが開いた状態（LocalStorage使用）',
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

export const WithShareModalAndImagesInUrl = {
  args: {
    getShareableState: () => mockGetShareableState(true),
  },
  parameters: {
    docs: {
      description: {
        story: 'シェアモーダルが開いた状態（画像をURLに含める）',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // シェアボタンをクリック
    const shareButton = canvasElement.querySelector('button:nth-child(4)');
    if (shareButton) {
      shareButton.click();
    }

    // 少し待ってからチェックボックスをクリック
    setTimeout(() => {
      const checkbox = canvasElement.querySelector('#includeImages');
      if (checkbox) {
        checkbox.click();
      }
    }, 100);
  },
};
