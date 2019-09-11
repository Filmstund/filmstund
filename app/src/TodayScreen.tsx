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

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={fetching} onRefresh={executeQuery} />
      }
    >
      {!fetching &&
        data && (
          <ShowingListItemContainer>
            <RedHeader>Mina kommande besök</RedHeader>
            <OrderedShowingList
              order={"asc"}
              showings={data.publicShowings.filter(
                filterShowingsParticipatedByMeAndAfterToday(data.me.id)
              )}
              onPressShowing={onPressShowing}
              onPressTicket={onPressTicket}
            />

            <RedHeader>Mina tidigare besök</RedHeader>
            <OrderedShowingList
              order={"desc"}
              showings={data.publicShowings.filter(
                filterShowingsParticipatedByMeAndBeforeToday(data.me.id)
              )}
              onPressShowing={onPressShowing}
              onPressTicket={onPressTicket}
            />
          </ShowingListItemContainer>
        )}
    </ScrollView>
  );
};