import React, { forwardRef } from "react";
import { Pressable, View } from "react-native";
import { theme } from "../theme/theme";

const FloatingAddButton = forwardRef(function FloatingAddButton(
  { onPress, children, style, ...rest },
  ref
) {
  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      style={({ pressed }) => [
        {
          top: -18,
          transform: pressed ? [{ scale: 0.96 }] : [{ scale: 1 }],
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
      {...rest}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 999,
          backgroundColor: theme.colors.accent,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: theme.colors.accent,
          shadowOpacity: 0.25,
          shadowRadius: 20,
          shadowOffset: { width: 8, height: 10 },
          elevation: 12,
        }}
      >
        {/* top-left highlight */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 999,
            shadowColor: theme.shadow.light,
            shadowOpacity: 1,
            shadowRadius: 14,
            shadowOffset: { width: -5, height: -6 },
          }}
        />
        {children}
      </View>
    </Pressable>
  );
});

export default FloatingAddButton;