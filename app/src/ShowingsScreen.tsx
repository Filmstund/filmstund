import isBefore from "date-fns/isBefore";
import { groupBy } from "lodash";
import * as React from "react";
import { RefreshControl, ScrollView } from "react-native";
import { NavigationInjectedProps, StackActions } from "react-navigation";
import { showingDate, today } from "./lib/filterShowings";
import { OrderedShowingList } from "./OrderedShowingList";
import { RedHeader } from "./RedHeader";
import { ShowingListItemContainer } from "./ShowingListItemContainer";
import { useShowingsByMovieQuery } from "./useShowingsByMovieQuery";

export const ShowingsScreen: React.FC<NavigationInjectedProps> = ({
  navigation
}) => {
  const [{ data, fetching, error }, executeQuery] = useShowingsByMovieQuery();

  const showings = data ? data.publicShowings : [];

  const { previous = [], upcoming = [] } = groupBy(
    showings,
    s => (isBefore(showingDate(s), today) ? "previous" : "upcoming")
  );

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

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={fetching} onRefresh={executeQuery} />
      }
    >
      <ShowingListItemContainer>
        <RedHeader>Aktuella besök</RedHeader>
        <OrderedShowingList
          order={"asc"}
          showings={upcoming}
          onPressShowing={onPressShowing}
          onPressTicket={onPressTicket}
        />

        <RedHeader>Tidigare besök</RedHeader>
        <OrderedShowingList
          order={"desc"}
          showings={previous}
          onPressShowing={onPressShowing}
          onPressTicket={onPressTicket}
        />
      </ShowingListItemContainer>
    </ScrollView>
  );
};
