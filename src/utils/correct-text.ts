import { correct, CorrectionResults } from '../speller/correct';

function capitalize(word: string): string {
  return word.replace(/^[а-яё]/i, (firstLetter) => firstLetter.toUpperCase());
}

export default function correctText(text: string): string {
  const correctedText = text.replace(/[а-яё-]+/gi, (matchedWord) => {
    const {
      word,
      result,
    } = correct(matchedWord);

    if (result === CorrectionResults.CORRECTED) {
      if (matchedWord[0] === matchedWord[0].toUpperCase()) {
        return capitalize(word);
      }

      return word;
    }

    return matchedWord;
  });

  return correctedText;
}
