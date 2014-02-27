dot_editor
==========

これはブラウザで動くドット絵エディタなのだ

## 描画API

canvas.jsの描画用API

### 画像のインデックスデータを作る

```javascript
function createIndexData(w, h)
```

### 点を描く

```javascript
function drawDot(ctx, x, y, indexData, paletteIndex, scale)
```

### 直線を描く

```javascript
function drawLine(ctx, x0, y0, x1, y1, indexData, paletteIndex, scale)
```

- ctx: Canvasのコンテキスト
- x0, y0: 開始座標
- x1, y1: 終了座標
- indexData: 画像のインデックスデータ
- paletteIndex: パレット番号
- scale: 拡大率

## 画像のエンコード、デコード

### 1ビット画像をパックしてURLにする

```javascript
var data = pack(image.data),
    hash = Base64.encode(data);
location.hash = hash;
```

### インデックスデータをコードに変換する

```javascript
var hash = Base64.encode(image.data);
```
