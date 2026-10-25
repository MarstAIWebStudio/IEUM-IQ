
import { calculateScore, getScoreTier } from "./scoring.js";

const $ = (selector) => document.querySelector(selector);

function setText(selector, value) {
  const element = $(selector);

  if (element) {
    element.textContent = String(value);
  }
}

export function renderResult(age, answers, questions) {
  const result = calculateScore(age, answers, questions);
  const tier = getScoreTier(result.simulatedIndex);

  setText("#result-subtitle", `${age}세 기준 테스트 결과`);
  setText("#score-value", result.simulatedIndex);
  setText("#score-tier", tier.title);
  setText("#score-description", tier.description);
  setText("#correct-value", `${result.correct} / ${result.total}`);
  setText("#accuracy-value", `${result.accuracy}%`);
  setText("#result-age", `${age}세`);

  const level = result.accuracy >= 80
    ? "높은 정답률"
    : result.accuracy >= 50
      ? "중간 정답률"
      : "추가 연습 추천";

  setText("#level-value", level);

  const categoryNames = {
    pattern: "패턴 인식",
    logic: "논리 추론"
  };

  const categoryContainer = $("#category-results");
  categoryContainer.replaceChildren();

  for (const category of result.categoryResults) {
    const item = document.createElement("div");

    const label = document.createElement("div");
    label.className = "category-label";

    const name = document.createElement("span");
    name.textContent = categoryNames[category.category]
      ?? category.category;

    const value = document.createElement("strong");
    value.textContent = `${category.accuracy}%`;

    label.append(name, value);

    const track = document.createElement("div");
    track.className = "category-track";

    const fill = document.createElement("div");
    fill.className = "category-fill";
    fill.style.width = `${category.accuracy}%`;

    track.append(fill);
    item.append(label, track);
    categoryContainer.append(item);
  }

  const shareText = [
    "🧠 IEUM IQ 테스트 결과",
    `나이: ${age}세`,
    `지능 지수 시뮬레이션: ${result.simulatedIndex}`,
    `정답: ${result.correct}/${result.total}`,
    `정답률: ${result.accuracy}%`,
    "",
    "※ 공식 IQ 검사가 아닌 비공식 시뮬레이션 결과입니다."
  ].join("\n");

  setText("#share-preview", shareText);

  return {
    ...result,
    tier,
    shareText
  };
}

export async function shareResult(shareText) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: "IEUM IQ 테스트 결과",
        text: shareText,
        url: location.href
      });

      return "shared";
    } catch (error) {
      if (error.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  try {
    await navigator.clipboard.writeText(
      `${shareText}\n${location.href}`
    );

    return "copied";
  } catch {
    return "failed";
  }
}

export async function copyResult(shareText) {
  try {
    await navigator.clipboard.writeText(shareText);
    return true;
  } catch {
    return false;
  }
}
