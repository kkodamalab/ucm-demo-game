# UCM Co-op Lab

2台のスマートフォンを Player A / Player B として接続し、協調してタスク目標を維持する体験型UCMゲームです。

## 遊び方

1. PCでアプリを開き、**Create room** を選びます。
2. 表示されたA用・B用のQRコードを、それぞれ別のスマートフォンで読み取ります。
3. 各端末で Slider / Pressure-like Touch / Tilt を選択して入力します。
4. PC側でTrialを開始すると、Task値、ターゲット、波形、UCM平面、結果統計を確認できます。

## ローカル実行

Node.js 20以降で次を実行します。

```bash
npm install
npm start
```

`http://localhost:3000` を開きます。同じWi-Fiのスマートフォンで利用する場合は、PCのLAN IPアドレスを使って開いてください。

## デプロイ

Node.js とWebSocketをサポートするホスティング（Render、Railway、Fly.ioなど）へデプロイしてください。開始コマンドは `npm start` です。GitHub Pagesだけではリアルタイム中継サーバーを動かせません。

## UCM解析

線形タスクでは、Task Jacobianのnull spaceをUCM、row spaceをORTとして扱います。SUMでは UCM=(1,-1)/√2、ORT=(1,1)/√2 です。結果画面では `V_UCM`、`V_ORT`、`ΔV=(V_UCM−V_ORT)/(V_UCM+V_ORT)` を表示します。
