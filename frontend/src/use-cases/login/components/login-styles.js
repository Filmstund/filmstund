import styled from "styled-components";

export const Container = styled.div`
  display: grid;
  background-color: black;
`;

export const ContentContainer = styled.div`
  display: grid;
  background: white;
`;

export const LoginContainer = styled.div`
  height: 100vh;
  display: grid;
  justify-content: center;
  align-items: center;
`;

export const ErrorBox = styled.div`
  text-align: center;
  max-width: 500px;
  padding: 1em;
  background-color: #ef5353;
  color: white;
  margin: 0 0 2rem;
`;

export const LoginDialog = styled.div`
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
  padding: 2em;
  background-color: #fff;
  border: solid 1px #9e9e9e;
  border-radius: 3px;
  text-align: center;
`;

export const GoogleButton = styled.button`
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
  padding: 0.5em 1em;
  font-family: Roboto, sans-serif;
  font-size: 12pt;
  background-color: #fff;
  color: #212121;
  cursor: pointer;
  border: solid 1px #9e9e9e;
  border-radius: 3px;

  &:hover {
    background-color: #fafafa;
  }
`;

export const GoogleLogo = styled.img`
  display: inline-block;
  height: 2em;
  vertical-align: middle;
  margin-right: 0.7em;
`;
