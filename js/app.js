import { generateQuestions } from "./questions.js";
import { drawMain, drawOption } from "./canvas.js";

const $ = (selector) => document.querySelector(selector);

const screens = ["#home", "#test", "#result"];
const state = {
  age: 15,
  questions: [],
  index: 0,
  answers: {},
  finished: false
};

const TYPE_NAMES = {
  sequence: "반복 패턴",
  matrix: "행렬 추론",
  rotation: "도형 회전",
  symmetry: "대칭 추론",
  odd: "다른 그림 찾기",
  count: "도형 개수",
  size: "크기 패턴",
  position: "위치 이동"
};

function showScreen(id) {
  screens.forEach((screen) => {
    $(screen).classList.toggle("active", screen === id);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function startTest() {
  const age = Number($("#age").value);

  if (!Number.isInteger(age) || age < 1 || age > 99) {
    alert("나이는 1~99 사이의 정수로 입력해 줘.");
    $("#age").focus();
    return;
  }

  state.age = age;
  state.questions = getQuestions(age);
  state.index = 0;
  state.answers = {};
  state.finished = false;

  showScreen("#test");
  renderQuestion();
}

function renderQuestion() {
  const question = state.questions[state.index];

  if (!question) {
    showResult();
    return;
  }

  const number = state.index + 1;

  $("#counter").textContent = `${number} / ${state.questions.length}`;
  $("#progress").style.width =
    `${state.index / state.questions.length * 100}%`;

  $("#type-label").textContent = question.typeName;
  $("#difficulty").textContent = `난이도 ${question.difficulty}`;
  $("#question-title").textContent =
    `문제 ${number}. 그림 속 규칙을 찾아봐.`;

  $("#explanation").classList.add("hidden");
  $("#submit").classList.remove("hidden");
  $("#submit").disabled = true;
  $("#submit").textContent = "답 확인하기 →";

  drawMain($("#main-canvas"), question);

  const options = $("#options");
  options.replaceChildren();

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option";
    button.setAttribute("aria-label", `선택지 ${index + 1}`);

    const canvas = document.createElement("canvas");
    canvas.width = 260;
    canvas.height = 112;

    drawOption(canvas, question, index);
    button.append(canvas);

    if (state.answers[question.id]?.selected === index) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      if (state.answers[question.id]?.submitted) return;

      state.answers[question.id] = {
        selected: index,
        submitted: false
      };

      options.querySelectorAll(".option").forEach((element, i) => {
        element.classList.toggle("selected", i === index);
      });

      $("#submit").disabled = false;
    });

    options.append(button);
  });
}

function submitAnswer() {
  const question = state.questions[state.index];
  const answer = state.answers[question.id];

  if (!answer || answer.submitted) return;

  answer.submitted = true;
  answer.correct = answer.selected === question.answer;

  $("#options").querySelectorAll(".option").forEach((button) => {
    button.disabled = true;
  });

  $("#submit").classList.add("hidden");
  $("#explanation").classList.remove("hidden");

  const correct = answer.correct;
  const status = $("#answer-status");

  status.className = `answer-status ${correct ? "correct" : "incorrect"}`;
  status.textContent = correct
    ? "✓ 정답이야! 규칙을 정확히 찾았어."
    : "✕ 아쉽지만 오답이야. 해설을 확인해 봐.";

  $("#explanation-title").textContent = correct
    ? "정답 분석"
    : `정답: 선택지 ${question.answer + 1}`;

  $("#rule").textContent = question.rule;

  const steps = $("#steps");
  steps.replaceChildren();

  question.steps.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    steps.append(li);
  });

  const wrongAnalysis = $("#wrong-analysis");

  if (correct) {
    wrongAnalysis.textContent =
      "선택한 그림이 규칙에 맞아. 다음 문제에서는 다른 유형의 규칙도 찾아보자.";
  } else {
    const correctOption = question.options[question.answer];

    wrongAnalysis.textContent =
      `네 선택: ${describeOption(question, answer.selected)}. ` +
      `정답 그림: ${describeOption(question, question.answer)}. ` +
      "다시 그림을 관찰하고 어떤 규칙이 달랐는지 비교해 봐.";
  }

  $("#next").textContent =
    state.index === state.questions.length - 1
      ? "최종 결과 보기 →"
      : "다음 문제 →";

  $("#progress").style.width =
    `${(state.index + 1) / state.questions.length * 100}%`;
}

function describeOption(question, index) {
  const option = question.options[index];

  if (question.type === "rotation") {
    return `${option}도 회전`;
  }

  if (question.type === "symmetry") {
    return ({
      original: "원본",
      reflected: "대칭 그림",
      rotated: "회전 그림",
      different: "다른 도형"
    })[option];
  }

  if (question.type === "odd") {
    return question.visual.items[index];
  }

  if (question.type === "position") {
    return `격자 (${option.x + 1}, ${option.y + 1})`;
  }

  if (question.type === "count" || question.type === "size") {
    return String(option);
  }

  return String(option);
}

function nextQuestion() {
  if (state.index < state.questions.length - 1) {
    state.index += 1;
    renderQuestion();
  } else {
    showResult();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showResult() {
  state.finished = true;

  const questions = state.questions;
  const total = questions.length;

  const correct = questions.filter((question) =>
    state.answers[question.id]?.correct
  ).length;

  const accuracy = Math.round(correct / total * 100);

  $("#accuracy").textContent = `${accuracy}%`;
  $("#result-progress").style.width = `${accuracy}%`;
  $("#correct-count").textContent = `${total}문제 중 ${correct}문제 정답`;
  $("#result-caption").textContent =
    `${state.age}세 · 시각 추론 테스트 결과`;

  const categories = {};

  questions.forEach((question) => {
    const key = question.type;

    if (!categories[key]) {
      categories[key] = { total: 0, correct: 0 };
    }

    categories[key].total += 1;

    if (state.answers[question.id]?.correct) {
      categories[key].correct += 1;
    }
  });

  const categoryContainer = $("#category-results");
  categoryContainer.replaceChildren();

  Object.entries(categories).forEach(([key, value]) => {
    const percentage = Math.round(value.correct / value.total * 100);

    const row = document.createElement("div");
    row.className = "category-row";

    const head = document.createElement("div");
    head.className = "category-head";

    const name = document.createElement("b");
    name.textContent = TYPE_NAMES[key];

    const score = document.createElement("span");
    score.textContent = `${value.correct}/${value.total} · ${percentage}%`;

    head.append(name, score);

    const track = document.createElement("div");
    track.className = "mini-track";

    const fill = document.createElement("div");
    fill.className = "mini-fill";
    fill.style.width = `${percentage}%`;

    track.append(fill);
    row.append(head, track);
    categoryContainer.append(row);
  });

  renderReview();
  showScreen("#result");
}

function renderReview() {
  const list = $("#review-list");
  list.replaceChildren();

  state.questions.forEach((question) => {
    const answer = state.answers[question.id];
    const details = document.createElement("details");
    details.className = "review-item";

    const summary = document.createElement("summary");
    summary.textContent =
      `${answer.correct ? "✓" : "✕"} 문제 ${question.displayNumber} · ${question.typeName}`;

    const content = document.createElement("div");
    content.className = "review-detail";

    const rule = document.createElement("p");
    rule.textContent = `핵심 규칙: ${question.rule}`;

    const steps = document.createElement("ol");

    question.steps.forEach((step) => {
      const li = document.createElement("li");
      li.textContent = step;
      steps.append(li);
    });

    content.append(rule, steps);
    details.append(summary, content);
    list.append(details);
  });
}

async function shareResult() {
  const correct = state.questions.filter((question) =>
    state.answers[question.id]?.correct
  ).length;

  const accuracy = Math.round(correct / state.questions.length * 100);

  const text = [
    "🧠 IEUM IQ — Visual Reasoning Lab",
    `40문제 시각 추론 테스트`,
    `정답: ${correct}/40`,
    `정답률: ${accuracy}%`,
    "",
    "너도 그림 속 규칙을 찾아봐!"
  ].join("\n");

  if (navigator.share) {
    try {
      await navigator.share({
        title: "IEUM IQ 시각 추론 테스트",
        text,
        url: location.href
      });
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(`${text}\n${location.href}`);
    alert("결과와 링크를 복사했어!");
  } catch {
    alert(text);
  }
}

function retryTest() {
  startTest();
}

function initialize() {
  $("#start").addEventListener("click", startTest);
  $("#submit").addEventListener("click", submitAnswer);
  $("#next").addEventListener("click", nextQuestion);
  $("#retry").addEventListener("click", retryTest);
  $("#share").addEventListener("click", shareResult);

  $("#quit").addEventListener("click", () => {
    if (confirm("테스트를 종료할까? 현재 진행 상황은 사라져.")) {
      showScreen("#home");
    }
  });

  document.querySelectorAll("[data-age]").forEach((button) => {
    button.addEventListener("click", () => {
      $("#age").value = button.dataset.age;
    });
  });
}

initialize();
