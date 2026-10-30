import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/auth/LoginScreen.jsx";
import SignupScreen from "../screens/auth/SignupScreen.jsx";

// AuthStack defines the navigation flow for users who are not logged in
// Stack is shown when session = null (meaning not logged in)

// REFERENCE - https://reactnavigation.org/docs/stack-navigator/
// Using react-navigation/native-stack, faster than just react-navigation/stack
// native-stack uses "native navigation primitives"
// Navigator manages a stack of screens
const Stack = createNativeStackNavigator();

// Returns a navigator, not a screen
export default function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
        </Stack.Navigator>
    );
}