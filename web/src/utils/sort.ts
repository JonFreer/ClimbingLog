export function cmpStringsWithNumbers(a: string, b: string) {
  // Get rid of casing issues.
  a = a.toUpperCase();
  b = b.toUpperCase();

  // Regular expression to separate the digit string from the non-digit strings.
  const reParts = /\d+|\D+/g;

  // Regular expression to test if the string has a digit.
  const reDigit = /\d/;

  // Separates the strings into substrings that have only digits and those
  // that have no digits.
  const aParts = a.match(reParts);
  const bParts = b.match(reParts);

  // Used to determine if aPart and bPart are digits.
  let isDigitPart;

  // If `a` and `b` are strings with substring parts that match...
  if (
    aParts &&
    bParts &&
    (isDigitPart = reDigit.test(aParts[0])) == reDigit.test(bParts[0])
  ) {
    // Loop through each substring part to compare the overall strings.
    const len = Math.min(aParts.length, bParts.length);
    for (let i = 0; i < len; i++) {
      let aPart: string | number = aParts[i];
      let bPart: string | number = bParts[i];

      // If comparing digits, convert them to numbers (assuming base 10).
      if (isDigitPart) {
        aPart = parseInt(aPart, 10);
        bPart = parseInt(bPart, 10);
      }

      // If the substrings aren't equal, return either -1 or 1.
      if (aPart != bPart) {
        return aPart < bPart ? -1 : 1;
      }

      // Toggle the value of isDigitPart since the parts will alternate.
      isDigitPart = !isDigitPart;
    }
  }

  // Use normal comparison.
  return Number(a >= b) - Number(a <= b);
}
