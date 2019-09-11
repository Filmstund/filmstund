import * as React from "react";
import { RefreshControl, ScrollView } from "react-native";
import { NavigationInjectedProps, StackActions } from "react-navigation";
import {
  filterShowingsParticipatedByMeAndAfterToday,
  filterShowingsParticipatedByMeAndBeforeToday
} from "./lib/filterShowings";
import { OrderedShowingList } from "./OrderedShowingList";
import { RedHeader } from "./RedHeader";
import { ShowingListItemContainer } from "./ShowingListItemContainer";
import { useShowingsByMovieQuery } from "./useShowingsByMovieQuery";

export const TodayScreen: React.FC<NavigationInjectedProps> = ({
  navigation
}) => {
  const [{ data, fetching, error }, executeQuery] = useShowingsByMovieQuery();

  const onPressShowing = (showingId: string) =>
    navigation.dispatch(
      StackActions.push({
        routeName: "Showing",
        params: {
          showingId
        }
      })
    );

  const onPressTicket = (showingId: string) =>
    navigation.dispatch(
      StackActions.push({
        routeName: "Ticket",
        params: {
          showingId
        }
      })
    );

  const showings = data ? data.publicShowings : [];

  const meId = data && data.me ? data.me.id :  '';


  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={fetching} onRefresh={executeQuery} />
      }
    >

          <ShowingListItemContainer>
            <RedHeader>Mina kommande besök</RedHeader>
            <OrderedShowingList
              order={"asc"}
              showings={showings.filter(
                filterShowingsParticipatedByMeAndAfterToday(meId)
              )}
              onPressShowing={onPressShowing}
              onPressTicket={onPressTicket}
            />

            <RedHeader>Mina tidigare besök</RedHeader>
            <OrderedShowingList
              order={"desc"}
              showings={showings.filter(
                filterShowingsParticipatedByMeAndBeforeToday(meId)
              )}
              onPressShowing={onPressShowing}
              onPressTicket={onPressTicket}
            />
          </ShowingListItemContainer>
    </ScrollView>
  );
};
