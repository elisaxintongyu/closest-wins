type GuessResultInput = {
  value: number;
  team: {
    id: string;
    name: string;
  };
};

type RevealedQuestionResultInput = {
  correctAnswer: number;
  guesses: GuessResultInput[];
};

type TeamScoreInput = {
  id: string;
  name: string;
};

export function getQuestionWinners(question: RevealedQuestionResultInput) {
  if (question.guesses.length === 0) {
    return [];
  }

  const rankedGuesses = question.guesses.map((guess) => ({
    ...guess,
    distance: Math.abs(guess.value - question.correctAnswer),
  }));
  const winningDistance = Math.min(
    ...rankedGuesses.map((guess) => guess.distance)
  );

  return rankedGuesses.filter((guess) => guess.distance === winningDistance);
}

export function getScoreboard(
  teams: TeamScoreInput[],
  revealedQuestions: RevealedQuestionResultInput[]
) {
  const scores = new Map(
    teams.map((team) => [team.id, { ...team, score: 0, wins: 0 }])
  );

  for (const question of revealedQuestions) {
    for (const winner of getQuestionWinners(question)) {
      const current = scores.get(winner.team.id);

      if (!current) {
        continue;
      }

      current.score += 1;
      current.wins += 1;
    }
  }

  return Array.from(scores.values()).sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return left.name.localeCompare(right.name);
  });
}
