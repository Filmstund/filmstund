import * as React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { padding } from "./style";

export const ShowingListItemContainer: React.FC<{
  style?: StyleProp<ViewStyle>;
}> = ({ children, style = {} }) => (
  <View style={[{ padding }, style]}>{children}</View>
);
