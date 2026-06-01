# SoloCreate Portfolio Site 運用方針

## 結論

当面は、ルート直下の静的サイトに統一して運用します。

現在公開されている URL は GitHub Pages の静的サイトです。

https://solocreate1110.github.io/SoloCreate-portfolio-site/

このサイトは `index.html`、`assets/css/styles.css`、`assets/js/content.js`、`games/` で構成されています。新しい作品やゲームを追加するだけなら、Next.js に移行しなくても十分運用できます。

## 静的サイトを選ぶ理由

- GitHub Pages で無料公開でき、すでに公開済みです。
- `main` ブランチに push するだけで反映できます。
- ブラウザゲームを `games/ゲーム名/` に置くだけで公開できます。
- 更新箇所が少なく、初心者でも壊しにくい構成です。
- サーバー、データベース、環境変数が不要です。
- X やプロフィールに貼る公開リンクとしてすぐ使えます。

## Next.js 側を今すぐ使わない理由

`portfolio-site/portfolio-site/` には Next.js の構成がありますが、現時点では本番運用には使いません。

理由:

- プロフィールや作品がダミーデータのままです。
- Supabase 連携を前提にしたコードがありますが、まだ未接続です。
- GitHub Pages だけで運用するには追加設定が必要です。
- Vercel や環境変数など、運用で考えることが増えます。
- 今の目的である「アプリとゲームを誰でも見られる場所に置く」には過剰です。

## 今後の更新ルール

### アプリを追加する

`assets/js/content.js` の `apps` にカード情報を追加します。

### ゲームを追加する

1. `games/ゲーム名/` フォルダを作ります。
2. その中に `index.html` と必要なファイルを置きます。
3. `assets/js/content.js` の `games` にリンクを追加します。

例:

```js
{
  title: "New Game",
  status: "プレイ可能",
  description: "ゲームの説明をここに書きます。",
  tags: ["Game", "JavaScript"],
  theme: "warm",
  links: [
    {
      label: "Play",
      url: "games/new-game/",
    },
  ],
}
```

### お知らせを追加する

`assets/js/content.js` の `news` に日付つきで追加します。

## Next.js に移行するタイミング

次のどれかが必要になったら、Next.js 移行を検討します。

- ブログ記事をたくさん書き、カテゴリや検索を持たせたい
- 管理画面から作品や記事を更新したい
- Supabase などのデータベースで作品を管理したい
- コメント、いいね、ログイン機能を本当に運用したい
- 独自デザインの大規模な作品ギャラリーにしたい

それまでは、静的サイトで育てる方が安全です。

## 保留フォルダ

`portfolio-site/portfolio-site/` は、将来 Next.js に移行する場合の参考として残します。ただし、現在の公開サイトでは使いません。
