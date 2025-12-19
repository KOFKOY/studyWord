type GridOptions = {
  canvas: HTMLCanvasElement;
  character: string;
  useMiGrid: boolean;
  fontFamily: string;
};

function setupCanvasSize(canvas: HTMLCanvasElement) {
  const parent = canvas.parentElement;
  if (!parent) {
    return;
  }
  const rect = parent.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height || rect.width);
  const pixelRatio = window.devicePixelRatio || 1;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  canvas.width = size * pixelRatio;
  canvas.height = size * pixelRatio;
}

function drawGrid(ctx: CanvasRenderingContext2D, size: number, useMiGrid: boolean) {
  const lineColor = "#cccccc";
  const lineWidth = size * 0.006;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.rect(0, 0, size, size);
  ctx.stroke();
  const step = size / 3;
  ctx.beginPath();
  ctx.moveTo(step, 0);
  ctx.lineTo(step, size);
  ctx.moveTo(step * 2, 0);
  ctx.lineTo(step * 2, size);
  ctx.moveTo(0, step);
  ctx.lineTo(size, step);
  ctx.moveTo(0, step * 2);
  ctx.lineTo(size, step * 2);
  ctx.stroke();
  if (useMiGrid) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size, size);
    ctx.moveTo(size, 0);
    ctx.lineTo(0, size);
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(size / 2, size);
    ctx.moveTo(0, size / 2);
    ctx.lineTo(size, size / 2);
    ctx.stroke();
  }
}

function measureCharacterFontSize(
  ctx: CanvasRenderingContext2D,
  character: string,
  fontFamily: string,
  maxSize: number
) {
  let low = 10;
  let high = maxSize;
  let best = low;
  const padding = maxSize * 0.1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    ctx.font = `${mid}px ${fontFamily}`;
    const metrics = ctx.measureText(character);
    const width = metrics.width;
    const actualAscent = metrics.actualBoundingBoxAscent || mid;
    const actualDescent = metrics.actualBoundingBoxDescent || mid * 0.2;
    const height = actualAscent + actualDescent;
    if (width + padding <= maxSize && height + padding <= maxSize) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return best;
}

export async function drawGridAndCharacter(options: GridOptions): Promise<string> {
  const { canvas, character, useMiGrid, fontFamily } = options;
  setupCanvasSize(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return "";
  }
  const pixelRatio = window.devicePixelRatio || 1;
  const size = canvas.width / pixelRatio;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  ctx.save();
  drawGrid(ctx, size, useMiGrid);
  ctx.restore();
  const fontSize = measureCharacterFontSize(ctx, character, fontFamily, size);
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = "#000000";
  ctx.textBaseline = "alphabetic";
  const metrics = ctx.measureText(character);
  const textWidth = metrics.width;
  const ascent = metrics.actualBoundingBoxAscent || fontSize;
  const descent = metrics.actualBoundingBoxDescent || fontSize * 0.2;
  const textHeight = ascent + descent;
  const x = (size - textWidth) / 2;
  const y = (size + textHeight) / 2 - descent;
  ctx.fillText(character, x, y);
  return canvas.toDataURL("image/png");
}
