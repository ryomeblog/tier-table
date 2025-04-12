import React from 'react';
import TierList from './components/TierList';
import ControlPanel from './components/ControlPanel';
import './App.css';

function App() {
  const [items, setItems] = React.useState({
    storage: ['Item 1', 'Item 2', 'Item 3'],
    'tier-S': [],
    'tier-A': [],
    'tier-B': [],
    'tier-C': [],
    'tier-D': [],
  });

  const handleAddItem = content => {
    setItems(prev => ({
      ...prev,
      storage: [...prev.storage, content],
    }));
  };

  const handleClearAll = () => {
    setItems({
      storage: [],
      'tier-S': [],
      'tier-A': [],
      'tier-B': [],
      'tier-C': [],
      'tier-D': [],
    });
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white p-4">
      <header className="max-w-[800px] mx-auto mb-8">
        <h1 className="text-3xl font-bold text-center mb-4">ティア表(Tier表)メーカー</h1>
        <ControlPanel onAddItem={handleAddItem} onClearAll={handleClearAll} />
      </header>

      <main
        id="tier-list-container"
        className="max-w-[800px] mx-auto bg-dark-surface p-8 rounded-lg"
      >
        <TierList items={items} setItems={setItems} />
      </main>

      <footer className="max-w-[800px] mx-auto mt-8 text-center text-sm text-gray-400">
        <p>© 2025 Tier表メーカー</p>
      </footer>
    </div>
  );
}

export default App;
