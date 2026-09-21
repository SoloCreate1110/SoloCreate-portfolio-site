# SoloCreate Portfolio Site

SoloCreate の制作アプリ、ブラウザゲーム、アップデート、ブログを公開するための静的ポートフォリオサイトです。

サイトのページ構成と必要な動作は `SITE_SPEC.md` にまとめています。

## 更新方法

- トップページのアプリ、ゲーム、アップデートは `assets/js/content.js` を編集します。
- ブログはPages CMSの管理画面から更新します。設定は `.pages.yml`、記事は `_posts/` に保存されます。
- ブラウザゲームは `games/` の中にフォルダを追加します。
- GitHub Pages では `main` ブランチのルートを公開元にします。

## 運用方針

当面はルート直下の静的サイトを本番として運用します。
`portfolio-site/portfolio-site/` の Next.js 構成は将来移行用の参考として残し、現在の公開サイトでは使いません。

詳しくは `docs/site-direction.md` を参照してください。

## ローカル確認

通常ページは簡易サーバーで確認できます。ブログはGitHub PagesのJekyll処理で生成されるため、公開環境で最終確認します。

```powershell
python -m http.server 8000
```

その後、`http://localhost:8000` を開きます。

## ブラウザアプリの更新

- アプリ一覧は `apps/index.html` でブラウザアプリとモバイルアプリに分類します。
- ガチャの紹介: `apps/mayottara-gacha/`、起動画面: `apps/mayottara-gacha/play/`。
- ガチャのソースは `tools/mayottara-gacha/`。そのフォルダで `npm ci`、`npm run build` を実行すると公開用ファイルが更新されます。
- ソースと生成された `play/` をまとめてコミットし、`main` にpushするとGitHub Pagesへ反映されます。
- 保存データを維持するため、公開パスとlocalStorageのキーを継続利用してください。
