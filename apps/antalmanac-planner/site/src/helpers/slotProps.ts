export function createTooltipOffset(x: number, y: number) {
  return {
    popper: {
      modifiers: [
        {
          name: 'offset',
          options: { offset: [x, y] },
        },
      ],
    },
  };
}
