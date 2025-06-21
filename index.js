<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <title>ポリゴンショックGIFメーカー</title>
  <link href="https://fonts.googleapis.com/css2?family=Yusei+Magic&display=swap" rel="stylesheet" />
  <style>
    body {
      margin: 0;
      background: black;
      color: white;
      font-family: 'Yusei Magic', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }
    #canvas {
      border: 2px solid white;
      margin-top: 10px;
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
    }
    .controls {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
      padding: 10px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 5px;
      margin-top: 10px;
      align-items: center;
    }
    button, input, select {
      font-family: 'Yusei Magic', sans-serif;
      font-size: 0.8rem;
      padding: 5px 10px;
      border: 1px solid white;
      border-radius: 5px;
      background: rgba(0, 0, 0, 0.5);
      color: white;
      cursor: pointer;
      transition: background 0.3s ease;
      min-width: 100px;
    }
    button:hover, input:hover, select:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    label {
      display: flex;
      flex-direction: column;
      font-size: 0.75rem;
      color: #ddd;
      min-width: 110px;
    }
    h1, p {
      margin: 5px 0;
      text-align: center;
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js"></script>
</head>
<body>
<h1>ポリゴンショックメーカーv6</h1>
<p>GIFダウンロードに時間がかかる場合があります</p>
<p>made by nawa</p>
<div class="controls">
  <input type="file" id="upload" accept="image/*" />
  <label>点滅/秒:
    <input type="number" id="flashRate" min="1" max="50" value="10" />
  </label>
  <label>解像度選択:
    <select id="resolution">
      <option value="original">オリジナルサイズ</option>
      <option value="1024x720">1024x720</option>
      <option value="800x600">800x600</option>
      <option value="640x480">640x480</option>
    </select>
  </label>
  <label>ウォーターマーク:
    <input type="text" id="watermarkText" placeholder="例: PolygonShock" />
  </label>
  <label>カラー (#xxxxxx):
    <input type="text" id="watermarkColor" value="#ffffff" />
  </label>
  <label>フォントサイズ (px):
    <input type="number" id="watermarkFontSize" min="10" max="100" value="24" />
  </label>
  <label>透明度 (0.0〜1.0):
    <input type="number" id="watermarkOpacity" min="0" max="1" step="0.1" value="0.7" />
  </label>
  <label>位置:
    <select id="watermarkPosition">
      <option value="center">中央</option>
      <option value="top-left">左上</option>
      <option value="top">上</option>
      <option value="top-right">右上</option>
      <option value="left">左</option>
      <option value="right">右</option>
      <option value="bottom-left">左下</option>
      <option value="bottom">下</option>
      <option value="bottom-right">右下</option>
    </select>
  </label>
  <button id="flash">フラッシュ再生</button>
  <button id="downloadGif">GIFダウンロード</button>
</div>
<canvas id="canvas"></canvas>
<script>
  const upload = document.getElementById('upload')
  const canvas = document.getElementById('canvas')
  const ctx = canvas.getContext('2d')
  const flashRateInput = document.getElementById('flashRate')
  const resolutionSelect = document.getElementById('resolution')
  const flashBtn = document.getElementById('flash')
  const downloadGifBtn = document.getElementById('downloadGif')
  const watermarkTextInput = document.getElementById('watermarkText')
  const watermarkColorInput = document.getElementById('watermarkColor')
  const watermarkFontSizeInput = document.getElementById('watermarkFontSize')
  const watermarkOpacityInput = document.getElementById('watermarkOpacity')
  const watermarkPositionSelect = document.getElementById('watermarkPosition')
  let img = new Image()
  let imgLoaded = false
  let gifWorkerBlobUrl = null
  fetch('https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js')
    .then(r => r.blob())
    .then(b => {
      gifWorkerBlobUrl = URL.createObjectURL(b)
    })
  upload.addEventListener('change', e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = function(evt) {
      img.onload = () => {
        const maxWidth = canvas.clientWidth || 640
        const maxHeight = canvas.clientHeight || 480
        const scaleFactor = Math.min(maxWidth / img.width, maxHeight / img.height)
        canvas.width = img.width * scaleFactor
        canvas.height = img.height * scaleFactor
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        imgLoaded = true
      }
      img.src = evt.target.result
    }
    reader.readAsDataURL(file)
  })
  flashBtn.addEventListener('click', () => playFlash(false))
  downloadGifBtn.addEventListener('click', () => playFlash(true))
  function drawWatermark(text, color, fontSize, opacity, position) {
    if (!text) return
    ctx.font = `${fontSize}px 'Yusei Magic', sans-serif`
    ctx.fillStyle = hexToRgba(color, opacity)
    ctx.textBaseline = 'middle'
    let x = canvas.width / 2
    let y = canvas.height / 2
    switch(position) {
      case 'top-left':
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        x = 10
        y = 10
        break
      case 'top':
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        x = canvas.width / 2
        y = 10
        break
      case 'top-right':
        ctx.textAlign = 'right'
        ctx.textBaseline = 'top'
        x = canvas.width - 10
        y = 10
        break
      case 'left':
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        x = 10
        y = canvas.height / 2
        break
      case 'right':
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        x = canvas.width - 10
        y = canvas.height / 2
        break
      case 'bottom-left':
        ctx.textAlign = 'left'
        ctx.textBaseline = 'bottom'
        x = 10
        y = canvas.height - 10
        break
      case 'bottom':
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        x = canvas.width / 2
        y = canvas.height - 10
        break
      case 'bottom-right':
        ctx.textAlign = 'right'
        ctx.textBaseline = 'bottom'
        x = canvas.width - 10
        y = canvas.height - 10
        break
      case 'center':
      default:
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        x = canvas.width / 2
        y = canvas.height / 2
        break
    }
    ctx.fillText(text, x, y)
  }
  function hexToRgba(hex, alpha) {
    let c
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
      c= hex.substring(1).split('')
      if(c.length== 3){
        c= [c[0], c[0], c[1], c[1], c[2], c[2]]
      }
      c= '0x'+c.join('')
      return 'rgba(' + [(c>>16)&255, (c>>8)&255, c&255].join(',') + ',' + alpha + ')'
    }
    return `rgba(255,255,255,${alpha})`
  }
  function playFlash(saveAsGif = false) {
    if (!imgLoaded) {
      alert("画像をアップロードしてください！")
      return
    }
    let flashesPerSecond = parseInt(flashRateInput.value)
    if (isNaN(flashesPerSecond) || flashesPerSecond < 1 || flashesPerSecond > 50) {
      alert("点滅回数は1〜50で入力してください！")
      return
    }
    let width, height
    if (resolutionSelect.value === "original") {
      width = img.width
      height = img.height
    } else {
      [width, height] = resolutionSelect.value.split('x').map(Number)
    }
    canvas.width = width
    canvas.height = height
    const interval = 1000 / flashesPerSecond
    const totalDuration = 5000
    let start = performance.now()
    let colors = ["red", "blue", "white"]
    let i = 0
    const watermarkText = watermarkTextInput.value.trim()
    const watermarkColor = watermarkColorInput.value || "#ffffff"
    const watermarkFontSize = parseInt(watermarkFontSizeInput.value) || 24
    const watermarkOpacity = parseFloat(watermarkOpacityInput.value)
    const watermarkPosition = watermarkPositionSelect.value || "center"
    let gif
    if (saveAsGif) {
      gif = new GIF({
        workers: 2,
        quality: 10,
        workerScript: gifWorkerBlobUrl,
        width: canvas.width,
        height: canvas.height
      })
      gif.on('finished', function(blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `polygonshock_${width}x${height}.gif`
        link.click()
      })
    }
    function flashFrame(now) {
      const elapsed = now - start
      if (elapsed > totalDuration) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        drawWatermark(watermarkText, watermarkColor, watermarkFontSize, watermarkOpacity, watermarkPosition)
        if (saveAsGif && gif) gif.render()
        return
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      ctx.fillStyle = colors[i % colors.length]
      ctx.globalAlpha = 0.5 + Math.random() * 0.5
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.globalAlpha = 1.0
      drawWatermark(watermarkText, watermarkColor, watermarkFontSize, watermarkOpacity, watermarkPosition)
      if (saveAsGif && gif) {
        gif.addFrame(ctx, { copy: true, delay: interval })
      }
      i++
      setTimeout(() => {
        requestAnimationFrame(flashFrame)
      }, interval)
    }
    requestAnimationFrame(flashFrame)
  }
</script>
</body>
</html>
