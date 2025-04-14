# Tier List Maker

簡単にTierListを作成・共有できるWebアプリケーションです。ドラッグ&ドロップで項目を並び替え、作成したTierListを画像として保存できます。

## デモ

[Tier List Maker](https://ryomeblog.github.io/tier-table)でアプリケーションを利用できます。アプリケーションはGitHub Pagesでホストされており、いつでもアクセス可能です。

## 主な機能

- 🎯 ドラッグ&ドロップで簡単に項目を配置
- 📸 作成したTierListを画像として保存
- 🎨 カスタマイズ可能なTier設定
- 📱 レスポンシブデザイン対応

## 技術スタック

- [React](https://reactjs.org/) - UIライブラリ
- [@dnd-kit](https://dndkit.com/) - ドラッグ&ドロップ機能
- [TailwindCSS](https://tailwindcss.com/) - スタイリング
- [Storybook](https://storybook.js.org/) - UIコンポーネント開発
- [html-to-image](https://github.com/bubkoo/html-to-image) - 画像出力機能

## 開発環境のセットアップ

1. リポジトリのクローン:

```bash
git clone https://github.com/ryomeblog/tier-table.git
cd tier-table
```

2. 依存関係のインストール:

```bash
npm install
```

3. 開発サーバーの起動:

```bash
npm start
```

4. ブラウザで以下のURLにアクセス:

```
http://localhost:3000
```

## 利用可能なスクリプト

- `npm start` - 開発サーバーを起動
- `npm test` - テストを実行
- `npm run build` - プロダクション用ビルドを作成
- `npm run storybook` - Storybookを起動（コンポーネントの開発・確認用）
- `npm run format` - コードのフォーマット
- `npm run lint` - コードの静的解析

## デプロイ

このプロジェクトはGitHub Pagesを使用して自動的にデプロイされます。

1. main/masterブランチへの変更をプッシュすると、GitHub Actionsが自動的にビルドとデプロイを実行
2. デプロイされたアプリケーションは https://ryomeblog.github.io/tier-table で公開

手動でデプロイする場合は以下のコマンドを実行:

```bash
npm run deploy
```

## プロジェクト構造

```
src/
├── components/          # Reactコンポーネント
│   ├── TierList.jsx    # メインのTierListコンポーネント
│   ├── TierRow.jsx     # 各Tier行のコンポーネント
│   └── DraggableItem.jsx # ドラッグ可能なアイテム
├── stories/            # Storybookのストーリー
└── App.js             # アプリケーションのエントリーポイント
```

## 開発者向け情報

- コンポーネントの開発には[Storybook](http://localhost:6006)を使用しています
- コードの品質管理には[ESLint](https://eslint.org/)と[Prettier](https://prettier.io/)を使用しています
- GitHub Actionsを使用して自動デプロイを行っています

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
