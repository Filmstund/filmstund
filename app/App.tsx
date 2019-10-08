import {
  faCalendar,
  faFilm,
  faTicketAlt,
  faUser
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  GoogleSignin,
  GoogleSigninButton
} from "@react-native-community/google-signin";
import { cacheExchange } from "@urql/exchange-graphcache";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Image,
  SafeAreaView,
  StatusBar,
  Text,
  View
} from "react-native";

import {
  createAppContainer,
  CreateNavigatorConfig,
  createSwitchNavigator,
  NavigationRoute,
  NavigationStackRouterConfig
} from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import {
  NavigationStackConfig,
  NavigationStackOptions,
  NavigationStackProp
} from "react-navigation-stack/lib/typescript/types";
// @ts-ignore
import { createBottomTabNavigator } from "react-navigation-tabs";
import { createClient, dedupExchange, fetchExchange, Provider } from "urql";
import { AccountScreen } from "./src/AccountScreen";
import { getToken, setToken } from "./src/lib/session";
import { MoviesScreen } from "./src/MoviesScreen";
import { SessionContext, useSignOut } from "./src/session/SessionContext";
import { ShowingScreen } from "./src/ShowingScreen";
import { ShowingsScreen } from "./src/ShowingsScreen";
import { padding } from "./src/style";
import { TicketScreen } from "./src/TicketScreen";
import { TodayScreen } from "./src/TodayScreen";
import { meQuery } from "./src/useMeQuery";

GoogleSignin.configure({
  scopes: ["profile", "email", "openid"],
  webClientId:
    "692064172675-montab9pi57304e68r932c6lm7111oaf.apps.googleusercontent.com",
  iosClientId:
    "692064172675-ef9p2ad7khsr1k9l1pk6qtjc3u1elb4e.apps.googleusercontent.com"
});

const stackConfig: CreateNavigatorConfig<
  NavigationStackConfig,
  NavigationStackRouterConfig,
  NavigationStackOptions,
  NavigationStackProp<NavigationRoute, any>
> = {
  defaultNavigationOptions: {
    headerStyle: {
      backgroundColor: "#d0021b"
    },
    headerTitleStyle: {
      color: "white"
    },
    headerTintColor: "white"
  }
};

const TodayStack = createStackNavigator(
  {
    Today: {
      screen: TodayScreen,
      navigationOptions: options => ({
        title: "Idag"
      })
    },
    Showing: {
      screen: ShowingScreen
    },
    Ticket: {
      screen: TicketScreen
    }
  },
  stackConfig
);

const MoviesStack = createStackNavigator(
  {
    Movies: {
      screen: MoviesScreen,
      navigationOptions: options => ({
        title: "Filmer"
      })
    }
  },
  stackConfig
);

const HeaderLogoutButton: React.FC = () => {
  const signout = useSignOut();

  return <Button title={"Logga ut"} onPress={signout} color={"white"} />;
};

const AccountStack = createStackNavigator(
  {
    Account: {
      screen: AccountScreen,
      navigationOptions: options => ({
        title: "Konto",
        headerRight: <HeaderLogoutButton />
      })
    }
  },
  stackConfig
);

const ShowingsStack = createStackNavigator(
  {
    Showings: {
      screen: ShowingsScreen,
      navigationOptions: options => ({
        title: "Besök"
      })
    },
    Showing: {
      screen: ShowingScreen
    },
    Ticket: {
      screen: TicketScreen
    }
  },
  stackConfig
);

const TabNavigator = createBottomTabNavigator(
  {
    Today: {
      screen: TodayStack,
      navigationOptions: {
        title: "IDAG",
        tabBarIcon: ({ tintColor }) => (
          <FontAwesomeIcon icon={faCalendar} color={tintColor} size={22} />
        )
      }
    },
    Movies: {
      screen: MoviesStack,
      navigationOptions: {
        title: "FILMER",
        tabBarIcon: ({ tintColor }) => (
          <FontAwesomeIcon icon={faFilm} color={tintColor} size={22} />
        )
      }
    },
    Showings: {
      screen: ShowingsStack,
      navigationOptions: {
        title: "BESÖK",
        tabBarIcon: ({ tintColor }) => (
          <FontAwesomeIcon icon={faTicketAlt} color={tintColor} size={22} />
        )
      }
    },
    Account: {
      screen: AccountStack,
      navigationOptions: {
        title: "KONTO",
        tabBarIcon: ({ tintColor }) => (
          <FontAwesomeIcon icon={faUser} color={tintColor} size={22} />
        )
      }
    }
  },
  {
    tabBarOptions: {
      activeTintColor: "#fff",
      inactiveTintColor: "#e6b8be",
      labelStyle: {
        fontWeight: "500",
        color: "white"
      },
      style: {
        backgroundColor: "#d0021b"
      }
    }
  }
);

const AppNavigator = createSwitchNavigator({
  Home: TabNavigator
});

const AppContainer = createAppContainer(AppNavigator);

const client = createClient({
  url: "https://sefilm.bio/graphql",
  exchanges: [
    dedupExchange,
    cacheExchange({
      keys: {
        Participant: () => null,
        Location: () => null,
        Seat: () => null,
        Foretagsbiljett: data => (data as any).number
      }
    }),
    fetchExchange
  ],
  fetchOptions: () => ({
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })
});

const App: React.FC<{
  signedIn: boolean;
  setSignedIn: (b: boolean) => void;
}> = ({ signedIn, setSignedIn }) => {
  const [loaded, setLoaded] = useState(false);
  const [isSigninInProgress, setSigninInProgress] = useState(false);

  useEffect(() => {
    async function restoreToken() {
      try {
        const user = await GoogleSignin.signInSilently();
        console.log(user);

        if (user.idToken) {
          setToken(user.idToken);
          setSignedIn(true);
        }
      } catch (e) {
        return;
      } finally {
        setLoaded(true);
      }
    }
    restoreToken();
  }, []);

  const handleSignIn = async () => {
    setSigninInProgress(true);
    try {
      const userInfo = await GoogleSignin.signIn();

      if (userInfo.idToken) {
        setToken(userInfo.idToken);
        setSignedIn(true);
      }
    } catch (error) {
      console.log(error);

      setSignedIn(false);
    } finally {
      setSigninInProgress(false);
    }
  };

  if (!loaded) {
    return null;
  }

  if (signedIn) {
    return (
      <Provider value={client}>
        <StatusBar barStyle={"light-content"} />
        <AppContainer />
      </Provider>
    );
  } else {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black"
        }}
      >
        <StatusBar barStyle={"light-content"} />
        <View
          style={{
            alignItems: "center",
            backgroundColor: "white",
            padding,
            borderRadius: 3
          }}
        >
          <Image source={require("./logo.png")} />
          <Text style={{ padding, fontWeight: "500" }}>
            Logga in för att boka biobesök
          </Text>
          <GoogleSigninButton
            style={{ width: 230, height: 48 }}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Light}
            onPress={handleSignIn}
            disabled={isSigninInProgress}
          />
        </View>
      </SafeAreaView>
    );
  }
};

const Root = () => {
  const [signedIn, setSignedIn] = useState(false);

  const signout = useCallback(() => {
    GoogleSignin.signOut();
    setSignedIn(false);
  }, []);

  return (
    <SessionContext.Provider value={signout}>
      <App signedIn={signedIn} setSignedIn={setSignedIn} />
    </SessionContext.Provider>
  );
};

export default Root;
