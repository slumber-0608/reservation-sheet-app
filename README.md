# 予約表ジェネレーター

年月を選ぶだけで、その月の日数分の予約表をA4縦・1日1ページで生成し、ブラウザからまとめて印刷できるNext.jsアプリです。予約情報は入力・保存せず、紙へ手書きするための予約表だけを作ります。

## 本番環境

https://reservation-sheet-app.vercel.app

## 主な機能

- 現在年月の初期表示と、前月・翌月への移動
- 年・月の選択と、月曜始まりのカレンダー表示
- 土曜・日曜・日本の祝日の自動判定
- 平日を追加休日へ切り替え、一括解除する機能
- 平日版20行、土日祝版21行の予約表プレビュー
- 選択月の日数分をA4縦・1日1ページでまとめて印刷
- スマートフォン幅に対応した操作画面

## 技術構成

- Next.js（App Router）
- React / TypeScript
- Tailwind CSS
- `@holiday-jp/holiday_jp`（日本の祝日データをアプリ内で判定）
- localStorage（選択年月ごとの追加休日だけを端末内に保存）

## Ubuntuでのローカル起動

```bash
cd ~/projects/reservation-sheet-app
npm ci
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。環境変数は不要です。

## テスト方法

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

自動テストでは、追加休日の保存・復元、休日判定、年月移動、28日・29日・30日・31日の月で印刷DOMのページ数が月の日数と一致することを確認します。

## 印刷仕様

- 用紙: A4縦
- ページ: 1日1ページ（月の日数と同じページ数）
- 平日版: `11:`、`15:`、`16:`、`17:` を各5行、合計20行
- 土日祝版: `11:`、`15:`、`16:` を各7行、合計21行
- 土曜・日曜・日本の祝日・追加休日には土日祝版を使用
- 印刷時は操作画面を非表示にし、予約表だけを日付順に出力

ブラウザの印刷画面では、用紙をA4、向きを縦、倍率を100%に設定し、「ヘッダーとフッター」をオフにしてください。余白はCSSの印刷設定で制御されます。

## 追加休日とデータ保存

カレンダー上の平日を押すと、その日を「追加休日」として土日祝版へ切り替えます。もう一度押すと平日版へ戻ります。追加休日は `年-月` ごとにブラウザのlocalStorageへ保存され、元々の土日・祝日とは別データとして扱います。

このアプリは顧客情報や予約情報をサーバーへ送信・保存しません。追加休日も操作したブラウザ内だけに保存されます。

## デプロイと更新

Vercelの `reservation-sheet-app` プロジェクトがGitHubの `slumber-0608/reservation-sheet-app` の `main` ブランチに接続されています。以後は次の流れで本番へ反映されます。

```text
ローカルで修正 → GitHubのmainへpush → Vercelが自動デプロイ → 公開アプリ更新
```

Vercelの設定はFramework PresetがNext.js、Install Commandが `npm ci`、Build Commandが `npm run build`、Output DirectoryがNext.jsの自動設定、環境変数なしです。

## スマートフォンで印刷画面が開かない場合

「この月を印刷」は、ユーザーのクリック処理内で直接 `window.print()` を呼び出します。全日分の印刷DOMはあらかじめ描画済みなので、フレーム待機は不要です。ただし、APIが存在していても印刷画面を開かない環境があり、戻り値や `afterprint` から印刷成功を判定することはできません。

- iPhone Safari: 共有メニュー →「プリント」。
- Android Chrome: 右上の「⋮」→「共有」→「印刷」。印刷先で「PDFとして保存」も選べます。
- アプリ内ブラウザ: メニューからSafari/Chromeへ移動し、年月と追加休日を再確認して印刷。ブラウザ間でlocalStorageは共有されない場合があります。
- iPhoneでPDF保存:「プリント」のプレビューを広げ、共有から「ファイルに保存」。操作・対応状況はOSの版によって異なります。

共有メニュー経由でも印刷CSSが適用され、選択月の全日分を印刷する設計です。通常画面の共有から直接WebページをPDF化する機能は、印刷CSSと異なる結果になる可能性があるため、上記の印刷プレビュー経由で保存し、日数とページ数を確認してください。独自のPDF生成機能は追加していません。

### ブラウザ回帰テスト

```bash
npx playwright install chromium webkit
npm run build
npm run test:browser
```

本番ビルドをローカルの3100番ポートで起動して実行します。本番サイトへの反映はありません。

- Desktop Chromium、Pixel 7設定のChromium、iPhone 13設定のWebKitで年月選択、追加休日の切替・復元・解除、プレビュー、印刷呼び出し、例外時の案内、横スクロールがないことを検証。
- 各設定で28〜31日分の印刷DOM、A4幅、ページ内の高さ、改ページCSSを検証。
- ChromiumのPC・モバイル設定で実際にPDFを生成し、28・29・30・31ページ、A4縦、各ページの日付、末尾の注意事項、余分な空白ページがないことを検証。
- WebKitでは印刷CSSまでを検証。PDFページ分割、OSの印刷画面・共有メニュー・AirPrintは実機確認が必要です。

端末設定のエミュレーションは実機Safari/Chromeやアプリ内WebViewと同一ではありません。公開前にiPhone Safari、Android Chrome、使用するアプリ内ブラウザで、ボタン・共有メニュー・PDF保存のそれぞれを確認してください。

参考: [AppleのAirPrint手順](https://support.apple.com/en-gb/109349)、[Android Chromeの印刷・PDF保存手順](https://support.google.com/chrome/answer/1069693?co=GENIE.Platform%3DAndroid&hl=ja)、[Android WebViewの印刷制限](https://developer.android.com/training/printing/html-docs)。Android WebViewはHTML内のJavaScriptによる印刷開始に対応しないと明記されています。
