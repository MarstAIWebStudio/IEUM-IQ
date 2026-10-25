
const clamp = (value, min, max) =>
  Math.min(max, Math.max(min, value));

export function calculateScore(age, answers, questions) {
  const total = questions.length;

  const correct = questions.reduce((count, question) => {
    return count + (
      answers[question.id] === question.answer ? 1 : 0
    );
  }, 0);

  const accuracy = total > 0
    ? Math.round((correct / total) * 100)
    : 0;

  /*
   * 서비스 시연용 지수.
   *
   * 나이에 따른 차이를 보여주기 위한 임의 공식이며,
   * 심리측정학적으로 검증된 IQ 공식이 아니다.
   *
   * 실제 IQ로 사용하려면 연령별 표준화 자료가 필요하다.
   */

  const ageBonus = clamp(
    Math.round((30 - age) * 0.25),
    -15,
    15
  );

  const simulatedIndex = clamp(
    Math.round(70 + accuracy * 0.6 + ageBonus),
    55,
    145
  );

  const categories = {};

  for (const question of questions) {
    const key = question.category;

    if (!categories[key]) {
      categories[key] = {
        total: 0,
        correct: 0
      };
    }

    categories[key].total += 1;

    if (answers[question.id] === question.answer) {
      categories[key].correct += 1;
    }
  }

  const categoryResults = Object.entries(categories).map(
    ([category, value]) => ({
      category,
      total: value.total,
      correct: value.correct,
      accuracy: value.total
        ? Math.round(value.correct / value.total * 100)
        : 0
    })
  );

  return {
    age,
    total,
    correct,
    accuracy,
    simulatedIndex,
    ageBonus,
    categoryResults
  };
}

export function getScoreTier(score) {
  if (score >= 125) {
    return {
      title: "매우 높은 문제 해결 점수",
      description: "이번 테스트에서 높은 정답률을 기록했어요."
    };
  }

  if (score >= 110) {
    return {
      title: "높은 문제 해결 점수",
      description: "여러 문제의 규칙과 논리를 잘 찾아냈어요."
    };
  }

  if (score >= 90) {
    return {
      title: "균형 잡힌 문제 해결 점수",
      description: "다양한 유형의 문제를 풀어냈어요."
    };
  }

  if (score >= 75) {
    return {
      title: "더 연습해 볼 수 있어요",
      description: "다른 문제에도 도전하면서 풀이 방법을 익혀 보세요."
    };
  }

  return {
    title: "첫 번째 도전 완료!",
    description: "정답과 풀이를 확인하고 다시 도전해 보세요."
  };
}
