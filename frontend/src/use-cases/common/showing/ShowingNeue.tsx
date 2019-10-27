import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { faQrcode } from "@fortawesome/free-solid-svg-icons/faQrcode";
import React from "react";
import { formatShowingDateTime } from "../../../lib/dateTools";
import { Header } from "../ui/RedHeader";
import { ShowingNeue as ShowingNeueType } from "./__generated__/ShowingNeue";
import { Box, ButtonText, CenterColumn, Column, Content, Description, FaIcon, Poster, RedButton } from "./style";
import { UserHeads } from "./UserHeads";

interface Props {
  showing: ShowingNeueType;
  onClick: () => void;
  onClickTickets?: () => void;
}


export const ShowingNeue: React.FC<Props> = ({ showing, onClick, onClickTickets }) => {
  const showingHasTickets = showing.myTickets.length > 0;

  return (
    <Box onClick={onClick}>
      <Poster src={showing.movie.poster || ''} />
      <CenterColumn>
        <Content>
          <Header>{showing.movie.title}</Header>
          <Description>
            {formatShowingDateTime(showing.date + " " + showing.time)}
          </Description>
          <UserHeads users={showing.attendees.map(p => p.userInfo)} />
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
