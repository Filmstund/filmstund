import AsyncStorage from "@react-native-community/async-storage";

let token: string | null = null;

export const restoreTokenFromOfflineStorage = async (): Promise<string> => {
  token = await AsyncStorage.getItem("token");
  return token;
};

export const getToken = () => {
  return token;
};

export const setToken = (newToken: string) => {
  token = newToken;
  AsyncStorage.setItem("token", newToken);
};
