import React from "react";
import styled from "styled-components";
import orderBy from "lodash/orderBy";
import take from "lodash/take";
import { margin, largeMargin } from "./lib/style-vars";
import { Header } from "./RedHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import faQrcode from "@fortawesome/fontawesome-free-solid/faQrcode";
import faChevronRight from "@fortawesome/fontawesome-free-solid/faChevronRight";
import { formatShowingDateTime } from "./lib/dateTools";
import alfons from "./assets/alfons.jpg";
import gql from "graphql-tag";
import SeatRange from "./routes/ShowingTickets/SeatRange";

const Box = styled.div`
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

const Poster = styled.div`
  min-width: 120px;
  max-width: 120px;
  background-image: url(${props => props.src}), url(${alfons});
  background-size: cover;
  background-repeat: no-repeat;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const CenterColumn = styled(Column)`
  margin-left: ${largeMargin};
  margin-right: ${largeMargin};
  flex: 1;
  align-items: flex-start;
`;

const Content = styled.div``;

const FaIcon = styled(FontAwesomeIcon)`
  color: ${props => props.color};
  font-size: 17px;
`;

const RedButton = styled.button`
  background-color: #d0021b;
  cursor: pointer;
  font-size: 14px;
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

const ButtonText = styled.div`
  display: inline-block;
  margin-left: ${margin};
`;

const Description = styled.div`
  margin: ${margin} 0;
`;

const UsersContainer = styled.div`
  margin: ${margin} 0;
  display: flex;
  justify-content: flex-end;
  flex-direction: row-reverse;
`;

const PlusUsers = styled.div`
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #9b9b9b;
`;

const UserHead = styled.div`
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

const UserHeads = ({ users, maxCount = 5 }) => {
  const rest = users.length - maxCount;

  // Hack to shift people with default Google avatar to the end
  // For some reason the url of default avatars are longer
  const sortedHeads = orderBy(users, [u => u.avatar.length], ["asc"]);

  return (
    <UsersContainer>
      {rest > 0 && <PlusUsers>+{rest}</PlusUsers>}
      {take(sortedHeads, maxCount)
        .reverse()
        .map((user, index, list) => (
          <UserHead
            key={user.id}
            src={user.avatar}
            last={index === list.length - 1}
          />
        ))}
    </UsersContainer>
  );
};

const TicketRangeContainer = styled.div`
  margin-top: ${margin};
  font-size: 14px;
`;

const ScreenName = ({ ticket }) => {
  if (!ticket) {
    return null;
  }

  return (
    <div>
      {ticket.cinema.replace(/ ?Filmstaden ?/, "")}, {ticket.screen}
    </div>
  );
};

export const ShowingNeue = ({ showing, onClick, onClickTickets }) => {
  const showingHasTickets = showing.myTickets.length > 0;

  return (
    <Box onClick={onClick}>
      <Poster src={showing.movie.poster} />
      <CenterColumn>
        <Content>
          <Header>{showing.movie.title}</Header>
          <Description>
            {formatShowingDateTime(showing.date + " " + showing.time)}
          </Description>
          <UserHeads users={showing.participants.map(p => p.user)} />
          <ScreenName ticket={showing.myTickets[0]} />
          <TicketRangeContainer>
            <SeatRange ticketRange={showing.ticketRange} />
          </TicketRangeContainer>
        </Content>
        {showingHasTickets && (
          <RedButton
            disabled={!onClickTickets}
            onClick={e => {
              e.stopPropagation();
              if (onClickTickets) {
                onClickTickets();
              }
            }}
          >
            <FaIcon color="#fff" icon={faQrcode} />
            <ButtonText>Visa biljett</ButtonText>
          </RedButton>
        )}
      </CenterColumn>
      <Column>
        <FaIcon color="#9b9b9b" icon={faChevronRight} />
      </Column>
    </Box>
  );
};

export const showingFragment = gql`
  fragment ShowingNeue on Showing {
    id
    webId
    slug
    date
    time
    movie {
      id
      poster
      title
    }
    ticketRange {
      rows
      seatings {
        row
        numbers
      }
    }
    myTickets {
      id
      cinema
      screen
    }
    participants {
      user {
        id
        avatar
      }
    }
    location {
      name
    }
  }
`;
