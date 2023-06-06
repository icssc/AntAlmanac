function enumerate<T extends readonly string[]>(values: T) {
  return values.map((v) => `"${v}"`).join("|") as `"${T[number]}"`;
}

export default enumerate;
