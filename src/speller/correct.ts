import dictionary from '../config/russian-dictionary';
import edit from './edit';

export enum CorrectionResults {
  FOUND_IN_DICT = 1,
  CORRECTED = 2,
  NOT_FOUND = 3,
}

interface CorrectionResult {
  word: string;
  result: CorrectionResults,
}

export function correct(srcWord: string): CorrectionResult {
  const word = srcWord.toLowerCase();

  if (dictionary.has(word)) {
    return {
      word,
      result: CorrectionResults.FOUND_IN_DICT,
    };
  }

  const potentialSuitableWords = edit(word);

  for (let i = 0; i < potentialSuitableWords.length; i += 1) {
    if (dictionary.has(potentialSuitableWords[i])) {
      return {
        word: potentialSuitableWords[i],
        result: CorrectionResults.CORRECTED,
      };
    }
  }

  return {
    word,
    result: CorrectionResults.NOT_FOUND,
  };
}
