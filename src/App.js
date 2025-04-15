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
  const [isInitialized, setIsInitialized] = React.useState(false);

  // 不要なLocalStorageデータを削除する関数
  const cleanupUnusedImages = decodedData => {
    const usedKeys = new Set();
    Object.values(decodedData)
      .flat()
      .forEach(item => {
        if (item.type === 'image' && item.content.startsWith('tier-table-')) {
          usedKeys.add(item.content);
        }
      });

    Object.keys(localStorage)
      .filter(key => key.startsWith('tier-table-'))
      .forEach(key => {
        if (!usedKeys.has(key)) {
          localStorage.removeItem(key);
        }
      });
  };

  // URLからの状態の読み込み（初回のみ）
  useEffect(() => {
    if (isInitialized) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');

    if (data) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(data));
        if (decodedData && typeof decodedData === 'object') {
          const requiredKeys = ['storage', 'tier-S', 'tier-A', 'tier-B', 'tier-C', 'tier-D'];
          const hasAllKeys = requiredKeys.every(key => key in decodedData);
          if (hasAllKeys) {
            // 不要な画像データをクリーンアップ
            cleanupUnusedImages(decodedData);

            // データの復元処理
            const restoredData = Object.fromEntries(
              Object.entries(decodedData).map(([key, value]) => [
                key,
                value.map(item => {
                  if (item.type === 'image') {
                    // LocalStorageのキーの場合
                    if (item.content.startsWith('tier-table-')) {
                      const imageData = localStorage.getItem(item.content);
                      if (imageData) {
                        return {
                          ...item,
                          content: imageData, // 表示用の画像データ
                          imageKey: item.content, // LocalStorageのキーを保持
                          originalContent: imageData, // 元の画像データ
                        };
                      }
                    } else if (item.content.startsWith('data:image')) {
                      // Base64データの場合
                      const resizedImage = item.content;
                      const id = Date.now().toString();
                      const imageKey = `tier-table-${id}`;
                      // LocalStorageに保存
                      try {
                        localStorage.setItem(imageKey, resizedImage);
                      } catch (error) {
                        console.error('LocalStorageの保存に失敗:', error);
                      }
                      return {
                        ...item,
                        content: resizedImage, // 表示用の画像データ
                        imageKey: imageKey, // LocalStorageのキー
                        originalContent: item.content, // 元の画像データ
                      };
                    }
                    // 画像データが見つからない場合はプレースホルダーを表示
                    return {
                      ...item,
                      content: 'image',
                    };
                  }
                  return item;
                }),
              ])
            );
            setItems(restoredData);
          }
        }
      } catch (error) {
        console.error('URLパラメータの解析に失敗しました:', error);
      }
    }
    setIsInitialized(true);
  }, [isInitialized]);

  const resizeImage = imageContent => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 60;
        canvas.height = 60;

        // 画像を中心に配置してクロップ
        const size = Math.min(img.width, img.height);
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;

        ctx.drawImage(
          img,
          startX,
          startY, // ソースの開始位置
          size,
          size, // ソースのサイズ
          0,
          0, // 描画の開始位置
          60,
          60 // 描画のサイズ
        );

        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = imageContent;
    });
  };

  const handleAddItem = async (content, color) => {
    const isBase64Image = content.startsWith('data:image');
    if (isBase64Image) {
      const resizedImage = await resizeImage(content);
      const id = Date.now().toString();
      const imageKey = `tier-table-${id}`;

      // LocalStorageに画像を保存
      try {
        localStorage.setItem(imageKey, resizedImage);
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          // 古いデータを削除して再試行
          const keys = Object.keys(localStorage)
            .filter(k => k.startsWith('tier-table-'))
            .sort();

          if (keys.length > 0) {
            localStorage.removeItem(keys[0]);
            try {
              localStorage.setItem(imageKey, resizedImage);
            } catch (retryError) {
              console.error('LocalStorageの保存に失敗:', retryError);
            }
          }
        } else {
          console.error('LocalStorageの保存に失敗:', error);
        }
      }

      const newItem = {
        id,
        content: resizedImage, // 表示用の画像データ
        type: 'image',
        color: color,
        imageKey: imageKey, // LocalStorage参照用のキー
        originalContent: content, // 元の画像データ
      };
      setItems(prev => ({
        ...prev,
        storage: [...prev.storage, newItem],
      }));
    } else {
      const newItem = {
        id: Date.now().toString(),
        content: content,
        type: 'text',
        color: color,
      };
      setItems(prev => ({
        ...prev,
        storage: [...prev.storage, newItem],
      }));
    }
  };

  const handleEditItem = async (itemId, containerId, updatedItem) => {
    const isBase64Image = updatedItem.content.startsWith('data:image');
    let newContent = updatedItem.content;

    if (isBase64Image) {
      newContent = await resizeImage(updatedItem.content);
    }

    setItems(prev => ({
      ...prev,
      [containerId]: prev[containerId].map(item =>
        item.id === itemId
          ? {
              ...item,
              content: newContent,
              type: isBase64Image ? 'image' : 'text',
              color: updatedItem.color,
              originalContent: isBase64Image ? updatedItem.content : undefined,
            }
          : item
      ),
    }));
  };

  const handleRemoveItem = (itemId, containerId) => {
    // 画像アイテムの場合、LocalStorageから画像を削除
    const item = items[containerId].find(item => item.id === itemId);
    if (item?.type === 'image' && item.imageKey) {
      localStorage.removeItem(item.imageKey);
    }

    setItems(prev => ({
      ...prev,
      [containerId]: prev[containerId].filter(item => item.id !== itemId),
    }));
  };

  const handleClearAll = () => {
    // すべての画像アイテムのLocalStorageデータを削除
    Object.values(items)
      .flat()
      .forEach(item => {
        if (item.type === 'image' && item.imageKey) {
          localStorage.removeItem(item.imageKey);
        }
      });
    setItems(initialItems);
  };

  // LocalStorage用のユニークキーを生成
  const generateUniqueKey = () => {
    return `tier-table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // 現在の状態をURLエンコードして返す
  const getShareableState = (includeImages = false) => {
    // 新しいデータを生成
    const filteredItems = Object.fromEntries(
      Object.entries(items).map(([key, value]) => [
        key,
        value.map(({ id, content, type, color, imageKey }) => {
          if (type === 'image') {
            if (includeImages) {
              // LocalStorageから画像データを取得
              const imageData = localStorage.getItem(imageKey);
              console.log('imageData:', imageData);
              return {
                id,
                content: imageData, // Base64画像データをcontentに設定
                type: 'image', // 画像タイプを明示的に指定
                color,
              };
            } else {
              // LocalStorageのキーをそのまま使用
              return {
                id,
                content: imageKey, // LocalStorageのキー
                type: 'image', // 画像タイプを明示的に指定
                color,
              };
            }
          }
          // テキストアイテムは常にそのまま含める
          return {
            id,
            content,
            type: type || 'text',
            color,
          };
        }),
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
