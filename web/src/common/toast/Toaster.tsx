import React from "react";
import { useToastValue, useEjectToast } from "./ToastContext";
import styled from "@emotion/styled";
import { StatusBox } from "../../use-cases/common/utils/StatusMessageBox";
import { CSSTransition, TransitionGroup } from "react-transition-group";

const Container = styled.div`
  position: fixed;
  height: 100vh;
  width: 400px;
  top: 0;
  padding-top: 180px;
  padding-right: 16px;
  right: 0;
  pointer-events: none;

  .toast-enter {
    opacity: 0;
    transform: translateX(100px);
  }
  .toast-enter-active {
    opacity: 1;
    transform: translateX(0);
    transition: opacity 300ms, transform 300ms;
  }
  .toast-exit {
    opacity: 1;
  }
  .toast-exit-active {
    opacity: 0;
    transform: translateX(100px);
    transition: opacity 300ms, transform 300ms;
  }
`;

export const Toaster = () => {
  const toasts = useToastValue();
  const ejectToast = useEjectToast();

  return (
    <Container>
      <TransitionGroup component={null}>
        {toasts.map((t, i) => (
          <CSSTransition
            key={t.id}
            classNames="toast"
            timeout={5000}
            onEntered={() => ejectToast(t.id)}
          >
            <StatusBox error={t.variant === "danger"}>{t.text}</StatusBox>
          </CSSTransition>
        ))}
      </TransitionGroup>
    </Container>
  );
};
