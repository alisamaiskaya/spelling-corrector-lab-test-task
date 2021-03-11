import letters from '../config/letters';

// This algorithm was borrowed from Peter Norvig.
// http://norvig.com/spell-correct.html
// I didn't realize train method for dictionary. It's just an example of correcting
// words based on static dictionary's data.
// This simple spelling corrector knows nothing about words context or declensions
export default function edits(word: string): Array<string> {
  const results: Array<string> = [];

  // Deletion
  for (let i = 0; i < word.length; i += 1) {
    results.push(word.slice(0, i) + word.slice(i + 1));
  }

  // Transposition
  for (let i = 0; i < word.length - 1; i += 1) {
    results.push(
      word.slice(0, i) + word.slice(i + 1, i + 2) + word.slice(i, i + 1) + word.slice(i + 2),
    );
  }

  // Alteration
  for (let i = 0; i < word.length; i += 1) {
    letters.forEach((letter) => {
      results.push(word.slice(0, i) + letter + word.slice(i + 1));
    });
  }

  // Insertion
  for (let i = 0; i <= word.length; i += 1) {
    letters.forEach((letter) => {
      results.push(word.slice(0, i) + letter + word.slice(i));
    });
  }

  return results;
}
