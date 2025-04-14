import React, { useEffect } from 'react';
import TierList from './components/TierList';
import ControlPanel from './components/ControlPanel';
import './App.css';

// 初期状態
const initialItems = {
  storage: [],
  'tier-S': [],
  'tier-A': [],
  'tier-B': [],
  'tier-C': [],
  'tier-D': [],
};

function App() {
  const [items, setItems] = React.useState(initialItems);

  // URLからの状態の読み込み
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');

    if (data) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(data));
        if (decodedData && typeof decodedData === 'object') {
          // 必要なキーが全て存在することを確認
          const requiredKeys = ['storage', 'tier-S', 'tier-A', 'tier-B', 'tier-C', 'tier-D'];
          const hasAllKeys = requiredKeys.every(key => key in decodedData);

          if (hasAllKeys) {
            setItems(decodedData);
          }
        }
      } catch (error) {
        console.error('URLパラメータの解析に失敗しました:', error);
      }
    }
  }, []);

  const handleAddItem = (content, color) => {
    const newItem = {
      id: content,
      content: content,
      color: color,
    };
    setItems(prev => ({
      ...prev,
      storage: [...prev.storage, newItem],
    }));
  };

  const handleEditItem = (itemId, containerId, updatedItem) => {
    setItems(prev => ({
      ...prev,
      [containerId]: prev[containerId].map(item =>
        item.id === itemId
          ? { ...item, content: updatedItem.content, color: updatedItem.color }
          : item
      ),
    }));
  };

  const handleRemoveItem = (itemId, containerId) => {
    setItems(prev => ({
      ...prev,
      [containerId]: prev[containerId].filter(item => item.id !== itemId),
    }));
  };

  const handleClearAll = () => {
    setItems(initialItems);
  };

  // 現在の状態をURLエンコードして返す
  const getShareableState = () => {
    const filteredItems = Object.fromEntries(
      Object.entries(items).map(([key, value]) => [
        key,
        value.map(({ id, content, color }) => ({ id, content, color })),
      ])
    );
    return JSON.stringify(filteredItems);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white p-4">
      <header className="max-w-[800px] mx-auto mb-8">
        <h1 className="text-3xl font-bold text-center mb-4">Tier表メーカー</h1>
        <ControlPanel
          onAddItem={handleAddItem}
          onClearAll={handleClearAll}
          onRemoveItem={handleRemoveItem}
          getShareableState={getShareableState}
        />
      </header>

      <main
        id="tier-list-container"
        className="max-w-[800px] mx-auto bg-dark-surface p-8 rounded-lg"
      >
        <TierList
          items={items}
          setItems={setItems}
          onRemoveItem={handleRemoveItem}
          onEditItem={handleEditItem}
        />
      </main>

      <footer className="max-w-[800px] mx-auto mt-8 text-center text-sm text-gray-400">
        <p>© 2025 ryomeblog</p>
      </footer>
    </div>
  );
}

export default App;
