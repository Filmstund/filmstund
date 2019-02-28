import styled from "@emotion/styled";
import { largeMargin, margin, SMALL_FONT_SIZE } from "../../../lib/style-vars";
import alfons from "../../../assets/alfons.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const Box = styled.div`
  height: 220px;
  padding: ${largeMargin};
  border-radius: 5px;
  background-color: #ffffff;
  border: 1px solid #f2f2f2;
  display: flex;
  flex-direction: row;
  cursor: pointer;
  transition: background-color 250ms ease-out;

  &:hover {
    background-color: #f2f2f2;
  }
`;

export const Poster = styled.div`
  min-width: 120px;
  max-width: 120px;
  background-image: url(${props => props.src}), url(${alfons});
  background-size: cover;
  background-repeat: no-repeat;
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const CenterColumn = styled(Column)`
  margin-left: ${largeMargin};
  margin-right: ${largeMargin};
  flex: 1;
  align-items: flex-start;
`;

export const Content = styled.div``;

export const FaIcon = styled(FontAwesomeIcon)`
  color: ${props => props.color};
  font-size: 17px;
`;

export const RedButton = styled.button`
  background-color: #d0021b;
  cursor: pointer;
  font-size: ${SMALL_FONT_SIZE};
  font-weight: 500;
  color: #fff;
  padding: ${largeMargin};
  display: flex;
  border-radius: 5px;
  align-items: center;

  transition: background-color 250ms ease-out;

  &:disabled {
    cursor: default;
    background-color: #ccc;
    color: #fff;

    &:hover {
      background-color: #ccc;
    }
  }

  &:hover {
    background-color: #970213;
  }
`;

export const ButtonText = styled.div`
  display: inline-block;
  margin-left: ${margin};
`;

export const Description = styled.div`
  margin: ${margin} 0;
`;

export const UsersContainer = styled.div`
  margin: ${margin} 0;
  display: flex;
  justify-content: flex-end;
  flex-direction: row-reverse;
`;

export const PlusUsers = styled.div`
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #9b9b9b;
`;

export const UserHead = styled.div`
  display: inline-block;
  background-image: url(${props => props.src});
  background-size: cover;
  background-repeat: no-repeat;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  border: 4px solid #fff;
  margin-left: ${props => (props.last ? "0" : "-10px")};
`;

export const TicketRangeContainer = styled.div`
  margin-top: ${margin};
  font-size: ${SMALL_FONT_SIZE};
`;
