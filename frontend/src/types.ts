export const exhaustSwitchCase = (param: never): never => {
  throw new Error("should not reach here");
};
