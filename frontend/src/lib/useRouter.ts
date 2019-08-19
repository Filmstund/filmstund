import { useContext } from "react";
import { __RouterContext, RouteComponentProps } from "react-router";

export const useRouter = <T = {}>(): RouteComponentProps<T> => {
  // @ts-ignore
  const routerContext: RouteComponentProps<T> = useContext(__RouterContext);

  return routerContext;
};
