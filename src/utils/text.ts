const chineseCharReg = /[\u3400-\u4DBF\u4E00-\u9FFF]/;

export function extractFirstChineseCharacter(input: string): string | null {
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (chineseCharReg.test(char)) {
      return char;
    }
  }
  return null;
}
