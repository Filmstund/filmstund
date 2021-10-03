import React from "react";
import itbioLogo from "./assets/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons/faCircleNotch";
import {
  Container,
  ErrorBox,
  GoogleButton,
  LoginContainer,
  LoginDialog,
} from "../components/login-styles";
import { useAuth0 } from "@auth0/auth0-react";

interface LoginProps {}

export const Login: React.VFC<LoginProps> = ({}) => {
  const { isLoading, error, loginWithRedirect } = useAuth0();
  const loaded = !isLoading;

  const cookiesBlocked = false;
  return (
    <Container>
      <LoginContainer>
        {error ? (
          <ErrorBox>{error.message}</ErrorBox>
        ) : cookiesBlocked ? (
          <ErrorBox>
            Du verkar ha blockerat tredjepartskakor, vänligen vitlista kakor
            från auth0 för att kunna logga in!
          </ErrorBox>
        ) : null}
        <LoginDialog>
          <img src={itbioLogo} height="260" alt="IT-bio logga" />
          <h3>Logga in för att boka biobesök!</h3>
          {loaded ? (
            !cookiesBlocked && (
              <GoogleButton onClick={() => loginWithRedirect()}>
                Logga in
              </GoogleButton>
            )
          ) : (
            <FontAwesomeIcon
              color="#d0021b"
              size="3x"
              icon={faCircleNotch}
              spin
            />
          )}
        </LoginDialog>
      </LoginContainer>
    </Container>
  );
};
