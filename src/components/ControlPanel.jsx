import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toPng } from 'html-to-image';

const ControlPanel = ({ onAddItem, onClearAll, onRemoveItem, getShareableState }) => {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#ff8a8a');
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareableUrl, setShareableUrl] = useState('');

  useEffect(() => {
    if (isShareModalOpen) {
      setShareableUrl(generateShareableUrl());
    }
  }, [isShareModalOpen]);

  const handleExportImage = async () => {
    try {
      const element = document.getElementById('tier-list-container');
      if (!element) return;

      // 元のスタイルを保存
      const originalStyles = {
        width: element.style.width,
        maxWidth: element.style.maxWidth,
        overflowX: element.style.overflowX,
        overflowY: element.style.overflowY,
      };

      // スクロール位置をリセットし、一時的にスクロールを無効化
      element.scrollLeft = 0;
      element.scrollTop = 0;
      element.style.width = 'auto';
      element.style.maxWidth = 'none';
      element.style.overflowX = 'visible';
      element.style.overflowY = 'visible';

      // 要素の実際のサイズを取得
      const { scrollWidth, scrollHeight } = element;

      const dataUrl = await toPng(element, {
        quality: 0.95,
        backgroundColor: '#1e1e1e',
        width: scrollWidth,
        height: scrollHeight,
      });

      // 元のスタイルを復元
      Object.entries(originalStyles).forEach(([key, value]) => {
        element.style[key] = value;
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

  const generateShareableUrl = () => {
    const state = getShareableState();
    const params = new URLSearchParams({ data: state });
    return `${window.location.origin}${window.location.pathname}?${params}`;
  };

  const truncateUrl = url => {
    if (url.length > 60) {
      return url.substring(0, 57) + '...';
    }
    return url;
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('URLのコピーに失敗しました:', err);
    }
  };

  const handleShareOnX = () => {
    const text = 'Tier表を作成しました！ #TierMaker';
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareableUrl)}`;
    window.open(tweetUrl, '_blank');
  };

  const handleShareOnLine = () => {
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareableUrl)}`;
    window.open(lineUrl, '_blank');
  };

  const handleAddItem = () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAddItem(reader.result, selectedColor);
        setSelectedFile(null);
      };
      reader.readAsDataURL(selectedFile);
    } else if (newItemText.trim()) {
      onAddItem(newItemText.trim(), selectedColor);
      setNewItemText('');
    }
    setIsAddingItem(false);
  };

  return (
    <div className="flex justify-center gap-4 mb-4">
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

      <button
        onClick={() => setIsShareModalOpen(true)}
        className="px-4 py-2 bg-[#333333] border border-[#555555] rounded hover:bg-[#444444] transition-colors flex items-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
        </svg>
        シェア
      </button>

      {/* Add Item Modal */}
      {isAddingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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

              <div>
                <label className="block mb-2">カードの色:</label>
                <input
                  type="color"
                  value={selectedColor}
                  onChange={e => setSelectedColor(e.target.value)}
                  className="w-full h-10 p-1 bg-[#333333] border border-[#555555] rounded cursor-pointer"
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

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-surface p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">シェア</h3>

            <div className="space-y-4">
              {/* URL Display */}
              <div className="bg-[#222222] p-3 rounded-lg break-all">
                <p className="text-sm text-gray-300 font-mono">{truncateUrl(shareableUrl)}</p>
              </div>

              <div className="relative">
                <button
                  onClick={handleCopyUrl}
                  className="w-full px-4 py-2 bg-[#333333] border border-[#555555] rounded hover:bg-[#444444] transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                  {copySuccess ? 'コピーしました！' : 'URLをコピー'}
                </button>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleShareOnX}
                  className="px-4 py-2 bg-[#333333] border border-[#555555] rounded hover:bg-[#444444] transition-colors flex items-center gap-2"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                    />
                  </svg>
                  Xでシェア
                </button>
                <button
                  onClick={handleShareOnLine}
                  className="px-4 py-2 bg-[#333333] border border-[#555555] rounded hover:bg-[#444444] transition-colors flex items-center gap-2"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.193 0-.378-.104-.483-.274L12.952 11.1v2.109c0 .346-.282.631-.631.631-.345 0-.627-.285-.627-.631V8.108c0-.27.174-.51.432-.596.064-.021.133-.031.199-.031.193 0 .375.104.48.274L14.25 9.883V7.774c0-.346.282-.63.63-.63.346 0 .63.284.63.63v5.105zm-5.741 0c0 .346-.282.631-.627.631-.348 0-.628-.285-.628-.631V8.108c0-.346.28-.63.628-.63.345 0 .627.284.627.63v4.771zm-2.466.631H4.917c-.345 0-.63-.285-.63-.631V8.108c0-.346.285-.63.63-.63.348 0 .63.284.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.648 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"
                    />
                  </svg>
                  LINEでシェア
                </button>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-4 py-2 bg-[#444444] rounded hover:bg-[#555555] transition-colors"
                >
                  閉じる
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
  onRemoveItem: PropTypes.func.isRequired,
  getShareableState: PropTypes.func.isRequired,
};

export default ControlPanel;
