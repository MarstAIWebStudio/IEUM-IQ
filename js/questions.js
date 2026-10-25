
const SHAPES = ["circle", "square", "triangle", "diamond"];
const SHAPE_NAMES = {
  circle: "원",
  square: "정사각형",
  triangle: "삼각형",
  diamond: "마름모"
};

const CATEGORIES = [
  { id: "sequence", name: "규칙 찾기" },
  { id: "matrix", name: "도형 행렬" },
  { id: "rotation", name: "회전 추론" },
  { id: "symmetry", name: "대칭 추론" },
  { id: "odd", name: "다른 도형 찾기" },
  { id: "counting", name: "개수 추론" },
  { id: "size", name: "크기 규칙" },
  { id: "position", name: "위치 이동" }
];

function shuffle(array, random = Math.random) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function makeRandom(seed) {
  let value = seed >>> 0;

  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function makeOptions(answer, candidates, random) {
  const unique = [...new Set(candidates)]
    .filter((item) => item !== answer);

  return shuffle([answer, ...shuffle(unique, random).slice(0, 3)], random);
}

function makeQuestion(category, level, index, random) {
  const id = `${category}-${level}-${index}`;
  const shape = () => SHAPES[Math.floor(random() * SHAPES.length)];

  if (category === "sequence") {
    const mode = index % 2;
    const a = shape();
    let b = shape();

    while (b === a) b = shape();

    const c = mode ? shape() : a;
    const answer = mode ? a : b;
    const items = mode ? [a, b, c, a, b, null] : [a, b, a, b, a, null];

    return {
      id, category, level,
      visual: { kind: "sequence", items },
      options: makeOptions(answer, SHAPES, random),
      answer,
      rule: mode
        ? "세 도형이 순서대로 반복돼."
        : "두 도형이 번갈아 나타나.",
      steps: [
        `첫 번째 도형은 ${SHAPE_NAMES[a]}이야.`,
        mode
          ? `${SHAPE_NAMES[a]} → ${SHAPE_NAMES[b]} → ${SHAPE_NAMES[c]} 순서가 반복돼.`
          : `${SHAPE_NAMES[a]}과 ${SHAPE_NAMES[b]}가 교대로 나타나.`,
        `따라서 빈칸에는 ${SHAPE_NAMES[answer]}이 들어가.`
      ]
    };
  }

  if (category === "matrix") {
    const shift = Math.floor(random() * 4);
    const grid = Array.from({ length: 3 }, (_, r) =>
      Array.from({ length: 3 }, (_, c) => SHAPES[(r + c + shift) % 4])
    );

    const answer = grid[2][2];
    grid[2][2] = null;

    return {
      id, category, level,
      visual: { kind: "matrix", grid },
      options: makeOptions(answer, SHAPES, random),
      answer,
      rule: "각 행과 열에서 도형이 일정한 순서로 바뀌어.",
      steps: [
        "첫 번째 행에서 오른쪽으로 갈 때 도형이 한 단계씩 바뀌어.",
        "다음 행도 같은 규칙을 따라.",
        `마지막 칸에는 ${SHAPE_NAMES[answer]}이 들어가.`
      ]
    };
  }

  if (category === "rotation") {
    const start = Math.floor(random() * 4) * 90;
    const turns = level + 1;
    const answer = (start + turns * 90) % 360;
    const angles = [0, 90, 180, 270];

    return {
      id, category, level,
      visual: { kind: "rotation", angle: start, turns },
      options: shuffle(angles, random),
      answer,
      rule: `도형을 시계 방향으로 ${turns}번, 매번 90도씩 돌려.`,
      steps: [
        `시작 각도는 ${start}도야.`,
        `${turns}번 회전하므로 ${turns} × 90 = ${turns * 90}도 회전해.`,
        `한 바퀴인 360도를 기준으로 계산하면 정답은 ${answer}도야.`
      ]
    };
  }

  if (category === "symmetry") {
    const original = shape();
    const axis = index % 2 === 0 ? "vertical" : "horizontal";

    return {
      id, category, level,
      visual: { kind: "symmetry", shape: original, axis },
      options: makeOptions(original, SHAPES, random),
      answer: original,
      rule: "대칭축을 기준으로 반대편에 같은 모양이 나타나.",
      steps: [
        `기준 도형은 ${SHAPE_NAMES[original]}이야.`,
        "대칭은 기준선에서 같은 거리만큼 반대편에 대응하는 모양을 놓는 규칙이야.",
        `따라서 대응하는 도형은 ${SHAPE_NAMES[original]}이야.`
      ]
    };
  }

  if (category === "odd") {
    const common = shape();
    let odd = shape();

    while (odd === common) odd = shape();

    const items = shuffle(
      [common, common, common, odd],
      random
    );

    return {
      id, category, level,
      visual: { kind: "odd", items },
      options: items.map((_, i) => i),
      answer: items.indexOf(odd),
      rule: "세 개는 같은 도형이고 하나만 모양이 달라.",
      steps: [
        `같은 도형은 ${SHAPE_NAMES[common]}이야.`,
        `다른 하나는 ${SHAPE_NAMES[odd]}이야.`,
        "따라서 다른 모양이 있는 위치를 선택하면 돼."
      ]
    };
  }

  if (category === "counting") {
    const count = 3 + (index % 5);
    const target = shape();

    return {
      id, category, level,
      visual: {
        kind: "counting",
        items: Array.from({ length: count }, () => target),
        count
      },
      options: makeOptions(count, [1, 2, 3, 4, 5, 6, 7, 8, 9], random),
      answer: count,
      rule: "그림에 있는 도형의 개수를 세면 돼.",
      steps: [
        `그림에는 ${SHAPE_NAMES[target]}이 반복돼.`,
        `도형을 하나씩 세면 총 ${count}개야.`,
        `따라서 정답은 ${count}개야.`
      ]
    };
  }

  if (category === "size") {
    const sizes = level % 2 === 0
      ? [2, 3, 4, 5, 6]
      : [6, 5, 4, 3, 2];

    const answer = sizes[sizes.length - 1];

    return {
      id, category, level,
      visual: { kind: "size", sizes: sizes.slice(0, 4), next: null },
      options: makeOptions(answer, [2, 3, 4, 5, 6, 7], random),
      answer,
      rule: level % 2 === 0
        ? "도형의 크기가 점점 커져."
        : "도형의 크기가 점점 작아져.",
      steps: [
        `크기 순서는 ${sizes.slice(0, 4).join(" → ")}이야.`,
        level % 2 === 0
          ? "각 도형이 이전보다 조금씩 커져."
          : "각 도형이 이전보다 조금씩 작아져.",
        `따라서 다음 크기는 ${answer}야.`
      ]
    };
  }

  // position
  const cells = Array.from({ length: 4 }, (_, i) => ({
    x: i % 3,
    y: i % 3
  }));

  const answer = {
    x: (cells[3].x + 1) % 3,
    y: (cells[3].y + 1) % 3
  };

  const options = shuffle([
    answer,
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: 0, y: 2 }
  ].filter((item, i, arr) =>
    arr.findIndex((other) =>
      other.x === item.x && other.y === item.y
    ) === i
  ), random);

  while (options.length < 4) {
    const candidate = {
      x: Math.floor(random() * 3),
      y: Math.floor(random() * 3)
    };

    if (!options.some((p) => p.x === candidate.x && p.y === candidate.y)) {
      options.push(candidate);
    }
  }

  return {
    id, category, level,
    visual: { kind: "position", cells },
    options,
    answer,
    rule: "점이 오른쪽 아래 방향으로 이동하고 가장자리에 닿으면 반대편으로 이어져.",
    steps: [
      "점의 위치가 한 칸씩 오른쪽 아래로 이동해.",
      "격자 가장자리를 넘으면 반대편에서 이어진다고 생각해.",
      `따라서 다음 위치는 (${answer.x + 1}, ${answer.y + 1})이야.`
    ]
  };
}

export function generateQuestions({ seed = Date.now() } = {}) {
  const random = makeRandom(seed);

  const questions = CATEGORIES.flatMap((category) =>
    Array.from({ length: 5 }, (_, i) =>
      makeQuestion(category.id, Math.floor(i / 2) + 1, i, random)
    )
  );

  return shuffle(questions, random).map((question, index) => ({
    ...question,
    number: index + 1
  }));
}

export { CATEGORIES, SHAPES, SHAPE_NAMES };
