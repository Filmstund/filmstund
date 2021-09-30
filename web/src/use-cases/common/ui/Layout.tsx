import { CSSProperties } from "react";
import styled from "@emotion/styled";

export const Box = styled.div<{
  indent?: number;
  spacing?: number;
  justifyContent?: CSSProperties["justifyContent"];
  alignItems?: CSSProperties["alignItems"];
  background?: CSSProperties["background"];
  border?: CSSProperties["border"];
  borderRadius?: CSSProperties["borderRadius"];
  flex?: CSSProperties["flex"];
}>(
  ({
    indent = 0,
    spacing = 0,
    justifyContent,
    alignItems,
    background,
    border,
    borderRadius,
    flex,
  }) => ({
    display: "flex",
    flexDirection: "column",
    padding: `${spacing * 8}px ${indent * 8}px`,
    justifyContent,
    alignItems,
    background,
    border,
    borderRadius,
    flex,
  })
);

export const Column = Box;

export const Row = styled(Box)({
  flexDirection: "row",
});

export const Space = styled.div<{ num?: number }>(({ num = 1 }) => ({
  width: `${num * 8}px`,
  height: `${num * 8}px`,
}));
