
import { SHAPE_NAMES } from "./questions.js";

const COLORS = {
  background: "#ffffff",
  ink: "#25213b",
  purple: "#7857ff",
  blue: "#53a7ff",
  green: "#39b982",
  orange: "#ffab54",
  muted: "#b8b5c9",
  light: "#f0edff"
};

function setupCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, rect.width || 320);
  const height = Math.max(1, rect.height || 220);
  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, width, height);

  return { ctx, width, height };
}

function drawShape(ctx, shape, x, y, size, color = COLORS.purple, angle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;

  const r = size / 2;

  ctx.beginPath();

  switch (shape) {
    case "circle":
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      break;

    case "square":
      ctx.rect(-r * 0.8, -r * 0.8, r * 1.6, r * 1.6);
      break;

    case "triangle":
      ctx.moveTo(0, -r);
      ctx.lineTo(r, r * 0.8);
      ctx.lineTo(-r, r * 0.8);
      ctx.closePath();
      break;

    case "diamond":
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.7, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-r * 0.7, 0);
      ctx.closePath();
      break;

    default:
      ctx.arc(0, 0, r, 0, Math.PI * 2);
  }

  ctx.fill();
  ctx.restore();
}

function drawQuestionMark(ctx, x, y, size = 32) {
  ctx.save();
  ctx.fillStyle = COLORS.orange;
  ctx.font = `bold ${size}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("?", x, y);
  ctx.restore();
}

function drawSequence(ctx, data, width, height) {
  const items = data.items || [];
  const count = items.length;
  const cellWidth = width / count;
  const size = Math.min(cellWidth * 0.52, height * 0.45);

  items.forEach((shape, index) => {
    const x = cellWidth * (index + 0.5);
    const y = height / 2;

    if (shape) {
      drawShape(ctx, shape, x, y, size);
    } else {
      drawQuestionMark(ctx, x, y, size * 0.75);
    }

    if (index < count - 1) {
      ctx.strokeStyle = COLORS.muted;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cellWidth * (index + 1), height * 0.25);
      ctx.lineTo(cellWidth * (index + 1), height * 0.75);
      ctx.stroke();
    }
  });
}

function drawMatrix(ctx, data, width, height) {
  const grid = data.grid;
  const rows = grid.length;
  const cols = grid[0].length;
  const cellWidth = width / cols;
  const cellHeight = height / rows;

  ctx.strokeStyle = COLORS.muted;
  ctx.lineWidth = 1.5;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellWidth;
      const y = r * cellHeight;

      ctx.strokeRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);

      const shape = grid[r][c];

      if (shape) {
        drawShape(
          ctx,
          shape,
          x + cellWidth / 2,
          y + cellHeight / 2,
          Math.min(cellWidth, cellHeight) * 0.48
        );
      } else {
        drawQuestionMark(
          ctx,
          x + cellWidth / 2,
          y + cellHeight / 2,
          Math.min(cellWidth, cellHeight) * 0.48
        );
      }
    }
  }
}

function drawRotation(ctx, data, width, height, option) {
  const angle = option === undefined
    ? data.angle
    : option;

  const size = Math.min(width, height) * 0.48;

  drawShape(
    ctx,
    "triangle",
    width / 2,
    height / 2,
    size,
    COLORS.purple,
    angle
  );

  ctx.fillStyle = COLORS.ink;
  ctx.font = "14px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${angle}°`, width / 2, height - 12);
}

function drawSymmetry(ctx, data, width, height) {
  const axis = data.axis || "vertical";
  const centerX = width / 2;
  const centerY = height / 2;
  const size = Math.min(width, height) * 0.42;

  ctx.save();
  ctx.strokeStyle = COLORS.blue;
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 2;
  ctx.beginPath();

  if (axis === "vertical") {
    ctx.moveTo(centerX, 12);
    ctx.lineTo(centerX, height - 12);
  } else {
    ctx.moveTo(12, centerY);
    ctx.lineTo(width - 12, centerY);
  }

  ctx.stroke();
  ctx.restore();

  if (axis === "vertical") {
    drawShape(
      ctx,
      data.shape,
      width * 0.27,
      centerY,
      size,
      COLORS.purple
    );

    drawShape(
      ctx,
      data.shape,
      width * 0.73,
      centerY,
      size,
      COLORS.green
    );
  } else {
    drawShape(
      ctx,
      data.shape,
      centerX,
      height * 0.27,
      size,
      COLORS.purple
    );

    drawShape(
      ctx,
      data.shape,
      centerX,
      height * 0.73,
      size,
      COLORS.green
    );
  }
}

function drawOdd(ctx, data, width, height) {
  const items = data.items || [];
  const cellWidth = width / items.length;
  const size = Math.min(cellWidth * 0.58, height * 0.52);

  items.forEach((shape, index) => {
    const x = cellWidth * (index + 0.5);
    const y = height / 2;

    drawShape(ctx, shape, x, y, size);

    ctx.fillStyle = COLORS.ink;
    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(index + 1), x, height - 12);
  });
}

function drawCounting(ctx, data, width, height) {
  const items = data.items || [];
  const count = items.length;
  const cols = Math.min(count, 4);
  const rows = Math.ceil(count / cols);
  const cellWidth = width / cols;
  const cellHeight = height / rows;
  const size = Math.min(cellWidth, cellHeight) * 0.52;

  items.forEach((shape, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;

    drawShape(
      ctx,
      shape,
      cellWidth * (col + 0.5),
      cellHeight * (row + 0.5),
      size
    );
  });
}

function drawSize(ctx, data, width, height, option) {
  const sizes = data.sizes || [];
  const count = sizes.length + 1;
  const cellWidth = width / count;

  sizes.forEach((size, index) => {
    drawShape(
      ctx,
      "circle",
      cellWidth * (index + 0.5),
      height / 2,
      size * 7,
      COLORS.purple
    );
  });

  const x = cellWidth * (count - 0.5);

  if (option !== undefined) {
    drawShape(ctx, "circle", x, height / 2, option * 7, COLORS.green);
  } else {
    drawQuestionMark(ctx, x, height / 2, 32);
  }
}

function drawPosition(ctx, data, width, height, option) {
  const miniWidth = width / 5;
  const miniSize = Math.min(miniWidth * 0.72, height * 0.7);
  const top = (height - miniSize) / 2;

  function drawMiniGrid(cx, point, missing = false) {
    const left = cx - miniSize / 2;
    const cell = miniSize / 3;

    ctx.strokeStyle = COLORS.muted;
    ctx.lineWidth = 1.5;

    for (let i = 0; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(left + i * cell, top);
      ctx.lineTo(left + i * cell, top + miniSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(left, top + i * cell);
      ctx.lineTo(left + miniSize, top + i * cell);
      ctx.stroke();
    }

    if (missing) {
      drawQuestionMark(ctx, cx, top + miniSize / 2, 28);
      return;
    }

    if (point) {
      drawShape(
        ctx,
        "circle",
        left + (point.x + 0.5) * cell,
        top + (point.y + 0.5) * cell,
        cell * 0.4,
        COLORS.purple
      );
    }
  }

  if (option === undefined) {
    data.cells.forEach((point, index) => {
      drawMiniGrid(miniWidth * (index + 0.5), point);
    });

    drawMiniGrid(miniWidth * 4.5, null, true);
    return;
  }

  drawMiniGrid(width / 2, option);
}

export function drawVisual(ctx, visual, width, height, option) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, width, height);

  switch (visual.kind) {
    case "sequence":
      drawSequence(ctx, visual, width, height);
      break;

    case "matrix":
      drawMatrix(ctx, visual, width, height);
      break;

    case "rotation":
      drawRotation(ctx, visual, width, height, option);
      break;

    case "symmetry":
      drawSymmetry(ctx, visual, width, height);
      break;

    case "odd":
      drawOdd(ctx, visual, width, height);
      break;

    case "counting":
      drawCounting(ctx, visual, width, height);
      break;

    case "size":
      drawSize(ctx, visual, width, height, option);
      break;

    case "position":
      drawPosition(ctx, visual, width, height, option);
      break;

    default:
      drawQuestionMark(ctx, width / 2, height / 2);
  }
}

export function drawQuestion(canvas, question) {
  const { ctx, width, height } = setupCanvas(canvas);
  drawVisual(ctx, question.visual, width, height);
}

export function drawOption(canvas, question, option) {
  const { ctx, width, height } = setupCanvas(canvas);

  const isIndexQuestion = question.visual.kind === "odd";
  const isAngleQuestion = question.visual.kind === "rotation";
  const isSizeQuestion = question.visual.kind === "size";
  const isPositionQuestion = question.visual.kind === "position";

  if (isIndexQuestion) {
    const shape = question.visual.items[option];
    drawShape(ctx, shape, width / 2, height / 2, Math.min(width, height) * 0.48);
    return;
  }

  if (isAngleQuestion) {
    drawRotation(ctx, question.visual, width, height, option);
    return;
  }

  if (isSizeQuestion) {
    drawSize(ctx, question.visual, width, height, option);
    return;
  }

  if (isPositionQuestion) {
    drawPosition(ctx, question.visual, width, height, option);
    return;
  }

  if (question.visual.kind === "counting") {
    ctx.fillStyle = COLORS.ink;
    ctx.font = `bold ${Math.min(width, height) * 0.55}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(option), width / 2, height / 2);
    return;
  }

  drawShape(
    ctx,
    option,
    width / 2,
    height / 2,
    Math.min(width, height) * 0.48
  );
}

export { COLORS, SHAPE_NAMES };
