
const COLORS = {
  ink: "#393451",
  purple: "#7558f5",
  blue: "#4c9eea",
  orange: "#f3a14c",
  green: "#3eaf87",
  muted: "#d7d3e8",
  bg: "#fbfaff"
};

function setup(canvas, width, height) {
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = COLORS.ink;
  ctx.fillStyle = COLORS.ink;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  return ctx;
}

function polygon(ctx, points, fill = "#e8e3ff") {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }

  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.stroke();
}

function drawShape(ctx, shape, x, y, size, color = COLORS.purple, angle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle * Math.PI / 180);
  ctx.strokeStyle = COLORS.ink;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.5;

  const r = size / 2;

  switch (shape) {
    case "circle":
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;

    case "square":
      ctx.fillRect(-r, -r, size, size);
      ctx.strokeRect(-r, -r, size, size);
      break;

    case "triangle":
      polygon(ctx, [[0, -r], [r, r], [-r, r]], color);
      break;

    case "diamond":
      polygon(ctx, [[0, -r], [r, 0], [0, r], [-r, 0]], color);
      break;

    case "star": {
      const points = [];

      for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? r : r * 0.43;
        const a = -Math.PI / 2 + i * Math.PI / 5;
        points.push([
          Math.cos(a) * radius,
          Math.sin(a) * radius
        ]);
      }

      polygon(ctx, points, color);
      break;
    }

    case "arrow":
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.7, 0);
      ctx.lineTo(r * 0.25, 0);
      ctx.lineTo(r * 0.25, r);
      ctx.lineTo(-r * 0.25, r);
      ctx.lineTo(-r * 0.25, 0);
      ctx.lineTo(-r * 0.7, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    default:
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
  }

  ctx.restore();
}

function drawQuestionMark(ctx, x, y, size = 32) {
  ctx.fillStyle = COLORS.purple;
  ctx.font = `800 ${size}px system-ui`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("?", x, y);
}

function drawSequence(ctx, data, width, height) {
  const items = data.items;
  const cell = width / items.length;
  const size = Math.min(42, cell * 0.42);

  items.forEach((shape, i) => {
    const x = cell * (i + 0.5);
    const y = height / 2;

    ctx.strokeStyle = COLORS.muted;
    ctx.strokeRect(i * cell + 4, 12, cell - 8, height - 24);

    if (shape) {
      drawShape(ctx, shape, x, y, size, i % 2 ? COLORS.blue : COLORS.purple);
    } else {
      drawQuestionMark(ctx, x, y, 35);
    }
  });
}

function drawMatrix(ctx, data, width, height) {
  const cellW = width / 3;
  const cellH = height / 3;

  data.cells.forEach((row, r) => {
    row.forEach((shape, c) => {
      const x = c * cellW;
      const y = r * cellH;

      ctx.strokeStyle = COLORS.muted;
      ctx.strokeRect(x + 5, y + 5, cellW - 10, cellH - 10);

      if (shape) {
        drawShape(
          ctx, shape,
          x + cellW / 2,
          y + cellH / 2,
          Math.min(cellW, cellH) * 0.42,
          [COLORS.purple, COLORS.blue, COLORS.orange][(r + c) % 3]
        );
      } else {
        drawQuestionMark(ctx, x + cellW / 2, y + cellH / 2, 30);
      }
    });
  });
}

function drawRotation(ctx, data, width, height) {
  const x = width / 2;
  const y = height / 2;

  drawShape(ctx, "arrow", x, y - 17, 85, COLORS.purple, data.angle);

  ctx.fillStyle = COLORS.muted;
  ctx.font = "13px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("회전 규칙", x, height - 17);
}

function drawSymmetry(ctx, data, width, height, option) {
  const mid = width / 2;
  const y = height / 2;

  ctx.save();
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = COLORS.muted;
  ctx.beginPath();
  ctx.moveTo(mid, 15);
  ctx.lineTo(mid, height - 15);
  ctx.stroke();
  ctx.restore();

  const base = data.shape;
  const angle = option === "rotated" ? 90 : 0;
  const mirrored = option === "reflected";

  drawShape(
    ctx, base,
    mid - 35, y, 42, COLORS.blue,
    0
  );

  if (option === "different") {
    drawShape(ctx, "star", mid + 40, y, 42, COLORS.orange);
  } else {
    ctx.save();

    if (mirrored) {
      ctx.translate(mid + 35, y);
      ctx.scale(-1, 1);
      drawShape(ctx, base, 0, 0, 42, COLORS.purple, angle);
    } else {
      drawShape(ctx, base, mid + 35, y, 42, COLORS.purple, angle);
    }

    ctx.restore();
  }
}

function drawOdd(ctx, data, width, height) {
  const items = data.items;
  const cell = width / items.length;

  items.forEach((shape, i) => {
    ctx.strokeStyle = COLORS.muted;
    ctx.strokeRect(i * cell + 4, 12, cell - 8, height - 24);

    drawShape(
      ctx, shape,
      cell * (i + 0.5), height / 2,
      Math.min(45, cell * 0.45),
      COLORS.purple
    );
  });
}

function drawCount(ctx, data, width, height) {
  const items = data.items;
  const cols = Math.min(5, Math.ceil(Math.sqrt(items.length)));
  const rows = Math.ceil(items.length / cols);
  const cellW = width / cols;
  const cellH = height / rows;

  items.forEach((shape, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;

    drawShape(
      ctx, shape,
      cellW * (col + 0.5),
      cellH * (row + 0.5),
      Math.min(cellW, cellH) * 0.45,
      [COLORS.purple, COLORS.blue, COLORS.orange][i % 3]
    );
  });
}

function drawSize(ctx, data, width, height) {
  const items = data.sizes;
  const cell = width / items.length;

  items.forEach((size, i) => {
    ctx.strokeStyle = COLORS.muted;
    ctx.strokeRect(i * cell + 3, 12, cell - 6, height - 24);

    if (size === null) {
      drawQuestionMark(ctx, cell * (i + 0.5), height / 2, 32);
    } else {
      drawShape(
        ctx, "circle",
        cell * (i + 0.5), height / 2,
        15 + size * 8,
        COLORS.purple
      );
    }
  });
}

function drawPosition(ctx, data, width, height, option) {
  const gridSize = Math.min(width, height) * 0.65;
  const left = (width - gridSize) / 2;
  const top = (height - gridSize) / 2;
  const cell = gridSize / 3;

  ctx.strokeStyle = COLORS.muted;
  ctx.lineWidth = 1.5;

  for (let i = 0; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(left + i * cell, top);
    ctx.lineTo(left + i * cell, top + gridSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(left, top + i * cell);
    ctx.lineTo(left + gridSize, top + i * cell);
    ctx.stroke();
  }

  const point = option ?? data.cells[data.cells.length - 1];

  drawShape(
    ctx, "circle",
    left + (point.x + 0.5) * cell,
    top + (point.y + 0.5) * cell,
    cell * 0.38,
    COLORS.purple
  );
}

export function drawMain(canvas, question) {
  const width = 720;
  const height = 300;
  const ctx = setup(canvas, width, height);
  const data = question.visual;

  switch (data.kind) {
    case "sequence": drawSequence(ctx, data, width, height); break;
    case "matrix": drawMatrix(ctx, data, width, height); break;
    case "rotation": drawRotation(ctx, data, width, height); break;
    case "symmetry": drawSymmetry(ctx, data, width, height, "original"); break;
    case "odd": drawOdd(ctx, data, width, height); break;
    case "count": drawCount(ctx, data, width, height); break;
    case "size": drawSize(ctx, data, width, height); break;
    case "position": drawPosition(ctx, data, width, height); break;
    default: drawQuestionMark(ctx, width / 2, height / 2);
  }
}

export function drawOption(canvas, question, optionIndex) {
  const width = 260;
  const height = 112;
  const ctx = setup(canvas, width, height);
  const data = question.visual;
  const option = question.options[optionIndex];

  switch (data.kind) {
    case "sequence":
    case "matrix":
      drawShape(ctx, option, width / 2, height / 2, 42, COLORS.purple);
      break;

    case "rotation":
      drawShape(ctx, "arrow", width / 2, height / 2, 52, COLORS.purple, option);
      break;

    case "symmetry":
      drawSymmetry(ctx, data, width, height, option);
      break;

    case "odd":
      drawShape(ctx, data.items[option], width / 2, height / 2, 48, COLORS.purple);
      break;

    case "count":
      ctx.fillStyle = COLORS.ink;
      ctx.font = "800 34px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(option), width / 2, height / 2);
      break;

    case "size":
      drawShape(
        ctx, "circle",
        width / 2, height / 2,
        10 + option * 12,
        COLORS.purple
      );
      break;

    case "position":
      drawPosition(ctx, data, width, height, option);
      break;
  }
}
