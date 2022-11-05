type IsMissing = (inputValue: unknown) => boolean;

export const isMissing: IsMissing = (inputValue) => {
  return inputValue === null || inputValue === undefined;
};
