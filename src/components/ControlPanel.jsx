import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { toPng } from 'html-to-image';

const ControlPanel = ({ onAddItem, onClearAll }) => {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleExportImage = async () => {
    try {
      const element = document.getElementById('tier-list-container');
      if (!element) return;

      const dataUrl = await toPng(element, {
        quality: 0.95,
        backgroundColor: '#1e1e1e',
      });

      // Create download link
      const link = document.createElement('a');
      link.download = 'tier-list.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('画像のエクスポートに失敗しました:', err);
    }
  };

  const handleShareOnX = async () => {
    try {
      const element = document.getElementById('tier-list-container');
      if (!element) return;

      // Generate image
      await toPng(element, {
        quality: 0.95,
        backgroundColor: '#1e1e1e',
      });

      // Create tweet URL
      const text = 'Tier表を作成しました！ #TierMaker';
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(tweetUrl, '_blank');
    } catch (err) {
      console.error('シェアに失敗しました:', err);
    }
  };

  const handleAddItem = () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAddItem(reader.result);
        setSelectedFile(null);
      };
      reader.readAsDataURL(selectedFile);
    } else if (newItemText.trim()) {
      onAddItem(newItemText.trim());
      setNewItemText('');
    }
    setIsAddingItem(false);
  };

  return (
    <div className="flex justify-center gap-4 mb-4">
      <button
        onClick={handleShareOnX}
        className="px-4 py-2 bg-[#333333] border border-[#555555] rounded hover:bg-[#444444] transition-colors"
      >
        X でシェア
      </button>

      <button
        onClick={() => setIsAddingItem(true)}
        className="px-4 py-2 bg-[#555555] border border-[#666666] rounded hover:bg-[#666666] transition-colors"
      >
        アイテム追加
      </button>

      <button
        onClick={handleExportImage}
        className="px-4 py-2 bg-[#555555] border border-[#666666] rounded hover:bg-[#666666] transition-colors"
      >
        画像保存
      </button>

      <button
        onClick={onClearAll}
        className="px-4 py-2 bg-[#ff6b6b] border border-[#ff5252] rounded hover:bg-[#ff5252] transition-colors"
      >
        すべて削除
      </button>

      {/* Add Item Modal */}
      {isAddingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-dark-surface p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">アイテムを追加</h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-2">テキスト:</label>
                <input
                  type="text"
                  value={newItemText}
                  onChange={e => setNewItemText(e.target.value)}
                  className="w-full p-2 bg-[#333333] border border-[#555555] rounded"
                  placeholder="テキストを入力"
                />
              </div>

              <div>
                <label className="block mb-2">または画像:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setSelectedFile(e.target.files?.[0])}
                  className="w-full p-2 bg-[#333333] border border-[#555555] rounded"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setIsAddingItem(false)}
                  className="px-4 py-2 bg-[#444444] rounded hover:bg-[#555555] transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAddItem}
                  className="px-4 py-2 bg-[#555555] rounded hover:bg-[#666666] transition-colors"
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ControlPanel.propTypes = {
  onAddItem: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired,
};

export default ControlPanel;
