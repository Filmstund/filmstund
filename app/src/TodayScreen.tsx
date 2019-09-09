import * as React from "react";
import { ScrollView } from "react-native";
import { ScreenProps, StackActions } from "react-navigation";
import { RedHeader } from "./RedHeader";
import { ShowingListItem } from "./ShowingListItem";
import { ShowingListItemContainer } from "./ShowingListItemContainer";

export const TodayScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const onPress = () =>
    navigation.dispatch(
      StackActions.push({
        routeName: "Ticket",
        params: {
          showingId: "showingId"
        }
      })
    );

  return (
    <ScrollView>
      <ShowingListItemContainer
        style={{ paddingVertical: 25, backgroundColor: "black" }}
      >
        <ShowingListItem onPressShowTicket={onPress}/>
      </ShowingListItemContainer>
      <ShowingListItemContainer>
        <RedHeader>Mina kommande besök</RedHeader>
        <ShowingListItem onPressShowTicket={onPress}/>
        <ShowingListItem onPressShowTicket={onPress}/>
        <ShowingListItem onPressShowTicket={onPress}/>
        <ShowingListItem onPressShowTicket={onPress}/>
        <ShowingListItem onPressShowTicket={onPress}/>
      </ShowingListItemContainer>
    </ScrollView>
  );
};
