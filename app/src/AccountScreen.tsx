import gql from "graphql-tag";
import * as React from "react";
import { Image, RefreshControl, ScrollView, Text, View } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { useQuery } from "urql";
import { AccountQuery } from "./__generated__/AccountQuery";
import { padding } from "./style";

export const useAccountQuery = () =>
  useQuery<AccountQuery>({
    query: gql`
      query AccountQuery {
        currentUser {
          avatar
          email
          firstName
          lastName
          nick
          phone
          filmstadenMembershipId
          calendarFeedUrl
          foretagsbiljetter {
            expires
            number
            status
          }
        }
      }
    `
  });

export const AccountScreen: React.FC<NavigationInjectedProps> = ({
  navigation
}) => {
  const [{ data, fetching, error }, executeQuery] = useAccountQuery();

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={fetching} onRefresh={executeQuery} />
      }
    >
      {data && (
        <View style={{ padding }}>
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "white",
              shadowColor: "black",
              shadowOpacity: 0.5,
              shadowOffset: { width: 0, height: 1 },
              shadowRadius: 3,
              marginBottom: 20
            }}
          >
            {data.currentUser.avatar && (
              <Image
                source={{
                  uri: data.currentUser.avatar,
                  height: 96,
                  width: 96
                }}
              />
            )}
            <View
              style={{
                paddingHorizontal: padding,
                flex: 1,
                justifyContent: "center"
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "700" }}>
                {data.currentUser.nick}
              </Text>
              <Text>
                {data.currentUser.firstName} {data.currentUser.lastName}
              </Text>
              <Text>{data.currentUser.email}</Text>
            </View>
          </View>
          <Text style={{ fontWeight: '300', fontSize: 16 }}>Företagsbiljetter</Text>
          <View style={{ flexDirection: "row", marginVertical: 10 }}>
            <View style={{ width: 120 }}>
              <Text>Nummer</Text>
            </View>
            <View style={{ width: 120 }}>
              <Text>Utgångsdatum</Text>
            </View>
            <View style={{ width: 100 }}>
              <Text>Status</Text>
            </View>
          </View>
          {data.currentUser.foretagsbiljetter.map(biljett => (
            <View style={{ flexDirection: "row" }}>
              <View style={{ width: 120 }}>
                <Text>{biljett.number}</Text>
              </View>
              <View style={{ width: 120 }}>
                <Text>{biljett.expires}</Text>
              </View>
              <View style={{ width: 100 }}>
                <Text>{biljett.status}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};
