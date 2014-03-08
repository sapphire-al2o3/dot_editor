dot_editor
==========

これはブラウザで動くドット絵エディタなのだ

## 描画API

canvas.jsの関数

### 画像のインデックスデータを作る

```javascript
function createIndexData(w, h)
```

### 点を描く

キャンバスに点を描く。

```javascript
function drawDot(ctx, x, y, indexData, paletteIndex, scale)
```

### 直線を描く

キャンバスに線を描く。

```javascript
function drawLine(ctx, x0, y0, x1, y1, indexData, paletteIndex, scale)
```

- ctx: Canvasのコンテキスト
- x0, y0: 開始座標
- x1, y1: 終了座標
- indexData: 画像のインデックスデータ
- paletteIndex: パレット番号
- scale: 拡大率

### 画像を消す

キャンバスを透明にしてインデックスデータを0にする。

```javascript
function clear(ctx, indexData)
```

### 白黒画像を表示するサンプルコード

```javascript
var ctx = document.getElementById('canvas').getContext('2d'),
    image = createIndexData(24, 24);

render(ctx, image, 16);

function render(ctx, image, scale) {
    var data = image.data,
        w = image.width,
        h = image.height;
    scale = scale || ctx.canvas.width / image.width;
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = '#000';
    for(var i = 0; i < h; i++) {
        for(var j = 0; j < w; j++) {
            // 画像データが0でない部分を塗りつぶす
            if(data[i * w + j]) {
                ctx.fillRect(j * scale, i * scale, scale, scale);
            }
        }
    }
}
```

## 画像のエンコード、デコードAPI

base64.jsの関数

### 1ビット画像をパックしてURLにする

```javascript
var data = pack(image.data),
    hash = Base64.encode(data);
location.hash = hash;
```

### URLを1ビット画像にする

```javascript
var hash = location.hash.slice(1);

if(hash) {
    var data = Base64.decode(hash);
    unpack(data, image.data);
}
```
