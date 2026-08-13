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
