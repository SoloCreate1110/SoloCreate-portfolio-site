# SoloCreate Portfolio Site

SoloCreate の制作アプリ、ブラウザゲーム、お知らせを公開するための静的ポートフォリオサイトです。

## 更新方法

- トップページのアプリ、ゲーム、お知らせは `assets/js/content.js` を編集します。
- ブラウザゲームは `games/` の中にフォルダを追加します。
- GitHub Pages では `main` ブランチのルートを公開元にします。

## 運用方針

当面はルート直下の静的サイトを本番として運用します。
`portfolio-site/portfolio-site/` の Next.js 構成は将来移行用の参考として残し、現在の公開サイトでは使いません。

詳しくは `docs/site-direction.md` を参照してください。

## ローカル確認

`index.html` をブラウザで開くと確認できます。簡易サーバーを使う場合は以下です。

```powershell
python -m http.server 8000
```

その後、`http://localhost:8000` を開きます。
