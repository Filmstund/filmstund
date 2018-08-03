import React from "react";
import { Header } from "../ui/RedHeader";
import faQrcode from "@fortawesome/fontawesome-free-solid/faQrcode";
import faChevronRight from "@fortawesome/fontawesome-free-solid/faChevronRight";
import { formatShowingDateTime } from "../../../lib/dateTools";
import LazyLoad from "react-lazyload";
import gql from "graphql-tag";
import {
  Box,
  ButtonText,
  CenterColumn,
  Column,
  Content,
  Description,
  FaIcon,
  Poster,
  RedButton
} from "./style";
import { UserHeads } from "./UserHeads";

export const ShowingNeue = ({ showing, onClick, onClickTickets }) => {
  const showingHasTickets = showing.myTickets.length > 0;

  return (
    <Box onClick={onClick}>
      <LazyLoad
        offset={window.innerHeight / 2}
        overflow
        placeholder={<Poster src={null} />}
      >
        <Poster src={showing.movie.poster} />
      </LazyLoad>
      <CenterColumn>
        <Content>
          <Header>{showing.movie.title}</Header>
          <Description>
            {formatShowingDateTime(showing.date + " " + showing.time)}
          </Description>
          <LazyLoad
            offset={window.innerHeight / 2}
            overflow
            placeholder={<UserHeads users={[]} />}
          >
            <UserHeads users={showing.participants.map(p => p.user)} />
          </LazyLoad>
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

ShowingNeue.fragments = {
  showing: gql`
    fragment ShowingNeue on Showing {
      date
      time
      movie {
        id
        poster
        title
      }
      myTickets {
        id
      }
      participants {
        user {
          id
          avatar
        }
      }
    }
  `
};
