import isBefore from "date-fns/isBefore";
import isSameDay from "date-fns/isSameDay";
import subMinutes from "date-fns/subMinutes";
import { orderBy } from "lodash";
import * as React from "react";
import { useHistory } from "react-router-dom";
import {
  navigateToShowing,
  navigateToShowingTickets,
} from "../common/navigators";
import { ShowingNeue } from "../common/showing/ShowingNeue";
import { FullWidthWrapper } from "../common/ui/PageWidthWrapper";
import { HomeQuery_showings } from "./__generated__/HomeQuery";
import { ItsHappeningTitle } from "./ItsHappeningTitle";
import { Jumbotron, JumbotronBackground } from "./Jumbotron";
import {
  filterShowingsParticipatedByMe,
  showingDate,
} from "./utils/filtersCreators";

interface FeaturedShowingProps {
  showings: HomeQuery_showings[];
  meId: string;
}

export const FeaturedShowing: React.FC<FeaturedShowingProps> = ({
  showings,
  meId,
}) => {
  const history = useHistory();

  const compareTime = subMinutes(new Date(), 30);

  const todayShowings = showings.filter(
    (s) =>
      filterShowingsParticipatedByMe(meId)(s) &&
      isBefore(compareTime, showingDate(s)) &&
      isSameDay(compareTime, showingDate(s))
  );

  const featuredShowing: HomeQuery_showings | undefined = orderBy(
    todayShowings,
    [showingDate],
    ["asc"]
  )[0];

  if (!featuredShowing) {
    return null;
  }

  return (
    <FullWidthWrapper>
      <JumbotronBackground>
        <Jumbotron>
          <ShowingNeue
            showing={featuredShowing}
            onClick={() => navigateToShowing(history, featuredShowing)}
            onClickTickets={() =>
              navigateToShowingTickets(history, featuredShowing)
            }
          />
          <ItsHappeningTitle>
            It's happening!{" "}
            <span role="img" aria-label="heart eyes emoji">
              😍
            </span>
          </ItsHappeningTitle>
        </Jumbotron>
      </JumbotronBackground>
    </FullWidthWrapper>
  );
};
