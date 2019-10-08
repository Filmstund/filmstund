import gql from "graphql-tag";
import * as React from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Text,
  View
} from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { useQuery } from "urql";
import {
  ShowingTicketsQuery,
  ShowingTicketsQuery_showing,
  ShowingTicketsQuery_showing_myTickets,
  ShowingTicketsQueryVariables
} from "./__generated__/ShowingTicketsQuery";
import { sfSansRegular } from "./lib/assets/fonts";
import { padding } from "./style";

const Ticket = ({
  ticket,
  width,
  fetching
}: {
  width: number;
  ticket: ShowingTicketsQuery_showing_myTickets;
  fetching: boolean;
}) => (
  <View
    style={{
      flex: 1,
      width: width,
      height: 500,
      alignItems: "stretch",
      padding
    }}
  >
    <View
      style={{
        borderRadius: 20,
        backgroundColor: "black",
        margin: padding,
        paddingTop: 40,
        flex: 1,
        alignItems: "center"
      }}
    >
      <View
        style={{
          borderRadius: 7,
          backgroundColor: "white",
          padding: 15
        }}
      >
        {fetching ? (
          <ActivityIndicator
            size={"large"}
            color={"black"}
            style={{ width: 128, height: 128 }}
          />
        ) : (
          <Image source={{ uri: ticket.barcode, width: 128, height: 128 }} />
        )}
      </View>
      <View style={{ margin: padding * 4, alignItems: "center" }}>
        <Text
          style={{
            fontFamily: sfSansRegular,
            color: "white",
            fontSize: 30,
            fontWeight: "500"
          }}
        >
          {ticket.screen}
        </Text>
        <View style={{ flexDirection: "row", margin: padding }}>
          <Text
            style={{ fontFamily: sfSansRegular, color: "white", fontSize: 20 }}
          >
            Rad {ticket.seat.row || "-"}
          </Text>
          <Text
            style={{
              fontFamily: sfSansRegular,
              color: "#7b7b7b",
              fontSize: 20
            }}
          >
            {" "}
            |{" "}
          </Text>
          <Text
            style={{ fontFamily: sfSansRegular, color: "white", fontSize: 20 }}
          >
            Stolsnr {ticket.seat.number || "-"}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: sfSansRegular,
            color: "white",
            fontSize: 35,
            fontWeight: "500"
          }}
        >
          {ticket.customerType}
        </Text>
      </View>
      <Text
        style={{ fontFamily: sfSansRegular, color: "#7b7b7b", fontSize: 14 }}
      >
        {ticket.id}
      </Text>
    </View>
  </View>
);

const emptyTicket: ShowingTicketsQuery_showing_myTickets = {
  __typename: "Ticket",
  barcode: "",
  customerType: "-",
  id: "",
  profileId: "-",
  screen: "-",
  seat: {
    __typename: "Seat",
    number: 0,
    row: 0
  }
};

const useShowingTickets = (showingId: string) =>
  useQuery<ShowingTicketsQuery, ShowingTicketsQueryVariables>({
    query: gql`
      query ShowingTicketsQuery($showingId: UUID!) {
        showing(id: $showingId) {
          id
          date
          time
          location {
            name
          }
          movie {
            id
            title
          }
          myTickets {
            customerType
            barcode
            id
            screen
            seat {
              number
              row
            }
            profileId
          }
        }
      }
    `,
    variables: { showingId }
  });

const TicketDetails = (props: { showing: ShowingTicketsQuery_showing }) => (
  <View
    style={{
      backgroundColor: "#f3f5f8",
      paddingTop: padding,
      paddingBottom: padding * 2,
      paddingHorizontal: padding * 2
    }}
  >
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: padding
      }}
    >
      <Text>Biograf</Text>
      <Text style={{ fontWeight: "600" }}>{props.showing.location.name}</Text>
    </View>
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: padding
      }}
    >
      <Text>Datum</Text>
      <Text style={{ fontWeight: "600" }}>{props.showing.date}</Text>
    </View>
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: padding
      }}
    >
      <Text>Tid</Text>
      <Text style={{ fontWeight: "600" }}>{props.showing.time}</Text>
    </View>
  </View>
);

export const TicketScreen: React.FC<
  NavigationInjectedProps<{ showingId: string }>
> = ({ navigation }) => {
  const showingId = navigation.state.params
    ? navigation.state.params.showingId
    : "undefined";
  const [{ data, error, fetching }, executeQuery] = useShowingTickets(
    showingId
  );

  const { width } = Dimensions.get("window");

  return (
    <View style={{ flex: 1 }}>
      <ScrollView horizontal pagingEnabled>
        {!data || fetching ? (
          <Ticket fetching={true} width={width} ticket={emptyTicket} />
        ) : (
          data.showing.myTickets.map(ticket => (
            <Ticket
              key={ticket.id}
              width={width}
              ticket={ticket}
              fetching={false}
            />
          ))
        )}
      </ScrollView>
      {data && <TicketDetails showing={data.showing} />}
    </View>
  );
};
