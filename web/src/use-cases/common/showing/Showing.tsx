import React from "react";
import { Header } from "../ui/RedHeader";
import { faQrcode } from "@fortawesome/free-solid-svg-icons/faQrcode";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { formatShowingDateTime } from "../../../lib/dateTools";
import {
  Box,
  ButtonText,
  CenterColumn,
  Column,
  Content,
  Description,
  FaIcon,
  Poster,
  RedButton,
} from "./style";
import { UserHeads } from "./UserHeads";
import { ShowingFragment } from "../../../__generated__/types";
import { showingDate } from "../../my-showings/utils/filtersCreators";

interface Props {
  showing: ShowingFragment;
  onClick: () => void;
  onClickTickets?: () => void;
}

export const ShowingNeue: React.VFC<Props> = ({
  showing,
  onClick,
  onClickTickets,
}) => {
  const showingHasTickets = showing.myTickets.length > 0;

  return (
    <Box onClick={onClick}>
      <Poster src={showing.movie.poster} />
      <CenterColumn>
        <Content>
          <Header>{showing.movie.title}</Header>
          <Description>
            {formatShowingDateTime(showingDate(showing))}
          </Description>
          <UserHeads users={showing.attendees.map((p) => p.userInfo)} />
        </Content>
        {showingHasTickets && (
          <RedButton
            disabled={!onClickTickets}
            onClick={(e) => {
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
