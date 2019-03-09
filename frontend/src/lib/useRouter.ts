import { useContext } from "react";
// @ts-ignore
import { __RouterContext, RouteComponentProps } from "react-router";

export const useRouter = <T = {}>(): RouteComponentProps<T> => {
  const routerContext: RouteComponentProps<T> = useContext(__RouterContext);

  return routerContext;
};
