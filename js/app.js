
import { getQuestions } from "./questions.js";
import { IQTest } from "./test.js";
import { renderResult, shareResult, copyResult } from "./result.js";

const $ = (selector) => document.querySelector(selector);

const screens = ["#home", "#test", "#result"];

let age = 15;
let test = null;
let result = null;

function showScreen(screenId) {
  for (const selector of screens) {
    $(selector).classList.toggle(
      "active",
      selector === screenId
    );
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function showMessage(message) {
  window.alert(message);
}

function startTest() {
  const input = $("#age");
  const parsedAge = Number(input.value);

  if (
    !Number.isInteger(parsedAge) ||
    parsedAge < 1 ||
    parsedAge > 99
  ) {
    showMessage("나이를 1세부터 99세 사이의 정수로 입력해 주세요.");
    input.focus();
    return;
  }

  age = parsedAge;
  test = new IQTest(getQuestions(age));

  showScreen("#test");
  renderQuestion();
}

function renderQuestion() {
  if (!test || test.finished) {
    finishTest();
    return;
  }

  const question = test.current;
  const currentNumber = test.index + 1;

  $("#question-counter").textContent =
    `QUESTION ${currentNumber} / ${test.total}`;

  $("#progress-bar").style.width =
    `${(currentNumber - 1) / test.total * 100}%`;

  $("#question-category").textContent = question.label;
  $("#question-title").textContent = question.title;
  $("#question-description").textContent = question.description;
  $("#question-visual").textContent = question.visual;

  const list = $("#answer-list");
  list.replaceChildren();

  for (const answer of question.options) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "answer-option";
    button.textContent = answer;

    if (test.answers[question.id] === answer) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      test.select(answer);

      for (const option of list.querySelectorAll("button")) {
        option.classList.toggle(
          "selected",
          option.textContent === answer
        );
      }

      $("#next-button").disabled = false;

      $("#next-button").textContent =
        currentNumber === test.total
          ? "결과 확인하기 →"
          : "다음 문제 →";
    });

    list.append(button);
  }

  $("#next-button").disabled =
    test.answers[question.id] === undefined;

  $("#next-button").textContent =
    currentNumber === test.total
      ? "결과 확인하기 →"
      : "다음 문제 →";
}

function finishTest() {
  $("#progress-bar").style.width = "100%";

  result = renderResult(
    age,
    test.answers,
    test.questions
  );

  showScreen("#result");
}

function nextQuestion() {
  if (!test || test.finished) {
    return;
  }

  if (!test.next()) {
    showMessage("답을 하나 선택해 주세요.");
    return;
  }

  if (test.finished) {
    finishTest();
    return;
  }

  renderQuestion();
}

async function onShare() {
  if (!result) {
    return;
  }

  const status = await shareResult(result.shareText);

  if (status === "copied") {
    showMessage("결과와 링크를 복사했어요!");
  } else if (status === "failed") {
    showMessage("공유할 수 없어요. 결과 텍스트 복사를 이용해 주세요.");
  }
}

async function onCopy() {
  if (!result) {
    return;
  }

  const copied = await copyResult(result.shareText);

  if (copied) {
    showMessage("결과를 클립보드에 복사했어요!");
  } else {
    showMessage("복사에 실패했어요. 브라우저 권한을 확인해 주세요.");
  }
}

function retryTest() {
  if (!test) {
    showScreen("#home");
    return;
  }

  test.reset();
  showScreen("#test");
  renderQuestion();
}

function exitTest() {
  const confirmed = window.confirm(
    "테스트를 종료할까요? 현재 진행 상황은 사라집니다."
  );

  if (confirmed) {
    showScreen("#home");
  }
}

function initialize() {
  for (const button of document.querySelectorAll("[data-age]")) {
    button.addEventListener("click", () => {
      $("#age").value = button.dataset.age;
    });
  }

  $("#start-button").addEventListener("click", startTest);
  $("#next-button").addEventListener("click", nextQuestion);
  $("#exit-button").addEventListener("click", exitTest);
  $("#share-button").addEventListener("click", onShare);
  $("#copy-button").addEventListener("click", onCopy);
  $("#retry-button").addEventListener("click", retryTest);

  $("#age").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      startTest();
    }
  });
}

initialize();
