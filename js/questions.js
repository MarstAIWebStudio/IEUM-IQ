
const TYPES = [
  { id: "sequence", name: "반복 패턴", difficulty: 1 },
  { id: "matrix", name: "행렬 추론", difficulty: 2 },
  { id: "rotation", name: "도형 회전", difficulty: 2 },
  { id: "symmetry", name: "대칭 추론", difficulty: 2 },
  { id: "odd", name: "다른 그림 찾기", difficulty: 1 },
  { id: "count", name: "도형 개수", difficulty: 1 },
  { id: "size", name: "크기 패턴", difficulty: 2 },
  { id: "position", name: "위치 이동", difficulty: 3 }
];

const SHAPES = ["circle", "square", "triangle", "diamond"];
const SHAPE_NAMES = {
  circle: "원",
  square: "정사각형",
  triangle: "삼각형",
  diamond: "마름모",
  star: "별"
};

function makeQuestion(id, type, level) {
  const seed = id * 17 + level * 13;
  const shift = seed % 4;

  switch (type) {
    case "sequence": {
      const a = SHAPES[shift];
      const b = SHAPES[(shift + 1) % 4];
      const c = SHAPES[(shift + 2) % 4];
      const mode = level % 2;

      const items = mode
        ? [a, b, c, a, b, null]
        : [a, b, a, b, a, null];

      const answer = mode ? c : b;
      const choices = [answer, a, b, SHAPES[(shift + 3) % 4]];
      const options = [...new Set(choices)];

      while (options.length < 4) {
        const candidate = SHAPES[(shift + options.length) % 4];
        if (!options.includes(candidate)) options.push(candidate);
      }

      return {
        visual: { kind: "sequence", items },
        options,
        answer: options.indexOf(answer),
        rule: mode
          ? "세 도형이 차례로 반복되는 규칙이야."
          : "두 도형이 번갈아 나타나는 규칙이야.",
        steps: [
          `첫 번째 도형은 ${SHAPE_NAMES[a]}이야.`,
          mode
            ? `${SHAPE_NAMES[a]} → ${SHAPE_NAMES[b]} → ${SHAPE_NAMES[c]} 순서가 반복돼.`
            : `${SHAPE_NAMES[a]}과 ${SHAPE_NAMES[b]}가 교대로 나타나.`,
          `따라서 빈칸에는 ${SHAPE_NAMES[answer]}이 들어가.`
        ]
      };
    }

    case "matrix": {
      const grid = Array.from({ length: 3 }, (_, r) =>
        Array.from({ length: 3 }, (_, c) => SHAPES[(r + c + shift) % 4])
      );

      const answer = grid[2][2];
      grid[2][2] = null;

      return {
        visual: { kind: "matrix", cells: grid },
        options: [answer, SHAPES[(shift + 1) % 4],
          SHAPES[(shift + 2) % 4], SHAPES[(shift + 3) % 4]],
        answer: 0,
        rule: "각 행에서 도형이 일정한 순서로 한 칸씩 바뀌어.",
        steps: [
          "첫 번째 행의 도형 순서를 관찰해.",
          "아래 행으로 내려갈 때도 같은 순환 규칙이 유지돼.",
          `빈칸은 ${SHAPE_NAMES[answer]}이야.`
        ]
      };
    }

    case "rotation": {
      const start = (level % 4) * 90;
      const turn = level % 2 ? 180 : 90;
      const answer = (start + turn) % 360;
      const angles = [0, 90, 180, 270];

      return {
        visual: {
          kind: "rotation",
          angle: start,
          targetAngle: answer
        },
        options: angles,
        answer: angles.indexOf(answer),
        rule: `화살표를 시계 방향으로 ${turn}도 회전해.`,
        steps: [
          `처음 방향은 ${start}도야.`,
          `회전량 ${turn}도를 더하면 ${start + turn}도가 돼.`,
          `한 바퀴는 360도이므로 결과 방향은 ${answer}도야.`
        ]
      };
    }

    case "symmetry": {
      const shape = SHAPES[shift];
      const reflected = shift % 2 === 0 ? "horizontal" : "vertical";

      return {
        visual: { kind: "symmetry", shape, axis: reflected },
        options: ["original", "reflected", "rotated", "different"],
        answer: 1,
        rule: "대칭축을 기준으로 거울에 비친 것처럼 뒤집어야 해.",
        steps: [
          `원래 도형은 ${SHAPE_NAMES[shape]}이야.`,
          "대칭은 축에서 같은 거리에 있는 점이 반대편에 놓이는 변환이야.",
          "회전하는 것이 아니라 축을 기준으로 반사한 그림이 정답이야."
        ]
      };
    }

    case "odd": {
      const normal = SHAPES[shift];
      const odd = SHAPES[(shift + 2) % 4];
      const items = [normal, normal, normal, odd];
      const order = (level + 1) % 4;
      [items[order], items[3]] = [items[3], items[order]];

      return {
        visual: { kind: "odd", items },
        options: [0, 1, 2, 3],
        answer: items.indexOf(odd),
        rule: "세 그림은 같은 모양이고 한 그림만 다른 모양이야.",
        steps: [
          `대부분의 그림은 ${SHAPE_NAMES[normal]}이야.`,
          `하나만 ${SHAPE_NAMES[odd]}으로 다르게 나타나.`,
          "다수의 그림과 모양이 다른 위치를 고르면 돼."
        ]
      };
    }

    case "count": {
      const count = 3 + (seed % 6);
      const shapes = Array.from(
        { length: count },
        (_, i) => SHAPES[(i + shift) % 4]
      );

      const choices = [count, count + 1, Math.max(1, count - 1), count + 2];

      return {
        visual: { kind: "count", items: shapes },
        options: choices,
        answer: 0,
        rule: "그림 안에 있는 도형의 총개수를 세면 돼.",
        steps: [
          "그림을 왼쪽에서 오른쪽으로 살펴봐.",
          "각 도형을 하나씩 세고 중복해서 세지 않도록 해.",
          `전체 도형은 ${count}개야.`
        ]
      };
    }

    case "size": {
      const sizes = level % 2
        ? [1, 2, 3, 1, 2, null]
        : [1, 2, 3, 4, null];

      const answer = level % 2 ? 3 : 5;

      return {
        visual: { kind: "size", sizes },
        options: [answer, 1, 2, 4],
        answer: 0,
        rule: "도형의 크기가 일정한 순서로 커지고 있어.",
        steps: [
          "각 도형의 크기를 비교해 봐.",
          "첫 번째 유형은 작은 크기부터 차례로 커져.",
          level % 2
            ? "세 단계 크기가 반복되므로 다음은 가장 큰 크기야."
            : "크기가 한 단계씩 증가하므로 다음은 다섯 번째 크기야."
        ]
      };
    }

    case "position": {
      const start = seed % 9;
      const dx = level % 2 ? 1 : 2;
      const dy = level % 2 ? 2 : 1;
      const cells = Array.from({ length: 4 }, (_, i) => ({
        x: (start % 3 + i * dx) % 3,
        y: (Math.floor(start / 3) + i * dy) % 3
      }));

      const last = cells[3];
      const answer = {
        x: (last.x + dx) % 3,
        y: (last.y + dy) % 3
      };

      return {
        visual: { kind: "position", cells, answer },
        options: [
          answer,
          { x: (answer.x + 1) % 3, y: answer.y },
          { x: answer.x, y: (answer.y + 1) % 3 },
          { x: (answer.x + 2) % 3, y: (answer.y + 2) % 3 }
        ],
        answer: 0,
        rule: "표시된 점이 격자 안에서 일정한 간격으로 이동해.",
        steps: [
          "연속된 그림에서 점의 위치를 비교해.",
          `가로 방향은 ${dx}칸, 세로 방향은 ${dy}칸씩 이동해.`,
          "격자의 끝을 넘으면 반대쪽에서 이어지는 규칙을 적용해."
        ]
      };
    }

    default:
      throw new Error(`Unknown question type: ${type}`);
  }
}

function shuffle(array, seed) {
  const result = [...array];
  let state = seed >>> 0;

  for (let i = result.length - 1; i > 0; i--) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export function getQuestions(age) {
  const questions = [];

  TYPES.forEach((type, typeIndex) => {
    for (let level = 1; level <= 5; level++) {
      const id = typeIndex * 5 + level;
      const question = makeQuestion(id, type.id, level);

      questions.push({
        id,
        type: type.id,
        typeName: type.name,
        difficulty: Math.min(5, type.difficulty + Math.floor((level - 1) / 2)),
        title: "그림 속 규칙을 찾아 빈칸을 완성해 봐.",
        visual: question.visual,
        options: question.options,
        answer: question.answer,
        rule: question.rule,
        steps: question.steps,
        age
      });
    }
  });

  return shuffle(questions, age * 997 + 41).map((q, i) => ({
    ...q,
    displayNumber: i + 1
  }));
}
