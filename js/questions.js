
const QUESTIONS = [
  {
    id: 1,
    category: "pattern",
    label: "PATTERN RECOGNITION",
    title: "다음에 올 숫자는 무엇일까요?",
    description: "숫자가 어떤 규칙으로 변하는지 찾아보세요.",
    visual: "2　4　6　8　?",
    options: ["9", "10", "11", "12"],
    answer: "10",
    explanation: "숫자가 2씩 증가하는 규칙입니다."
  },
  {
    id: 2,
    category: "logic",
    label: "LOGICAL REASONING",
    title: "다음 중 다른 하나는 무엇일까요?",
    description: "각 항목의 공통점을 생각해 보세요.",
    visual: "●　●　▲　●",
    options: ["첫 번째 ●", "두 번째 ●", "▲", "네 번째 ●"],
    answer: "▲",
    explanation: "나머지는 모두 원이고 하나만 삼각형입니다."
  },
  {
    id: 3,
    category: "pattern",
    label: "NUMBER PATTERN",
    title: "빈칸에 들어갈 수를 찾아보세요.",
    description: "각 숫자의 변화량을 살펴보세요.",
    visual: "3　6　12　24　?",
    options: ["36", "42", "48", "54"],
    answer: "48",
    explanation: "앞의 수에 2를 곱하는 규칙입니다."
  },
  {
    id: 4,
    category: "logic",
    label: "LOGICAL REASONING",
    title: "모든 블립은 파란색입니다. 민은 블립입니다.",
    description: "주어진 조건만으로 반드시 참인 것은?",
    visual: "조건 → 결론",
    options: [
      "민은 파란색이다",
      "모든 파란색은 블립이다",
      "민은 빨간색이다",
      "판단할 수 없다"
    ],
    answer: "민은 파란색이다",
    explanation: "모든 블립이 파란색이고 민이 블립이므로 민은 파란색입니다."
  },
  {
    id: 5,
    category: "pattern",
    label: "NUMBER PATTERN",
    title: "규칙에 맞는 다음 수는?",
    description: "숫자 사이의 차이를 확인하세요.",
    visual: "1　4　9　16　?",
    options: ["20", "24", "25", "36"],
    answer: "25",
    explanation: "1², 2², 3², 4², 5²의 순서입니다."
  },
  {
    id: 6,
    category: "logic",
    label: "ANALOGY",
    title: "새와 날개의 관계는 물고기와 무엇의 관계일까요?",
    description: "두 대상 사이의 기능적 관계를 생각하세요.",
    visual: "새 : 날개 = 물고기 : ?",
    options: ["다리", "지느러미", "털", "부리"],
    answer: "지느러미",
    explanation: "날개는 새의 이동을 돕고 지느러미는 물고기의 이동을 돕습니다."
  },
  {
    id: 7,
    category: "pattern",
    label: "NUMBER PATTERN",
    title: "다음에 올 숫자는 무엇일까요?",
    description: "일정하게 증가하는지 살펴보세요.",
    visual: "5　8　11　14　?",
    options: ["15", "16", "17", "18"],
    answer: "17",
    explanation: "3씩 증가하는 수열입니다."
  },
  {
    id: 8,
    category: "logic",
    label: "LOGICAL REASONING",
    title: "수진은 민수보다 키가 큽니다.",
    description: "민수는 지우보다 키가 큽니다. 반드시 참인 것은?",
    visual: "수진 > 민수 > 지우",
    options: [
      "지우가 가장 크다",
      "수진이 지우보다 크다",
      "민수와 수진은 같다",
      "알 수 없다"
    ],
    answer: "수진이 지우보다 크다",
    explanation: "수진이 민수보다 크고 민수가 지우보다 크므로 수진은 지우보다 큽니다."
  },
  {
    id: 9,
    category: "pattern",
    label: "NUMBER PATTERN",
    title: "빈칸에 들어갈 숫자는?",
    description: "이전 숫자와의 관계를 찾아보세요.",
    visual: "2　3　5　8　12　?",
    options: ["15", "16", "17", "18"],
    answer: "17",
    explanation: "1, 2, 3, 4, 5씩 차례로 더합니다."
  },
  {
    id: 10,
    category: "logic",
    label: "LOGICAL REASONING",
    title: "세 상자 중 하나에 보물이 있습니다.",
    description: "A에는 보물이 없고, 보물은 B 또는 C에 있습니다. B에도 보물이 없다면?",
    visual: "A ✕　B ✕　C ?",
    options: [
      "A에 있다",
      "B에 있다",
      "C에 있다",
      "어디에도 없다"
    ],
    answer: "C에 있다",
    explanation: "보물은 B 또는 C에 있고 B에는 없으므로 C에 있습니다."
  }
];

export function getQuestions(age) {
  // 현재는 기본 문제 세트를 사용한다.
  // 연령별 규준 및 검증된 문항 세트가 준비되면 여기서 분기한다.
  return QUESTIONS.map((question) => ({
    ...question,
    options: [...question.options]
  }));
}
