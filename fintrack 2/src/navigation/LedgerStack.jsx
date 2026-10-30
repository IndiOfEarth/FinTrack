import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LedgerScreen from "../screens/ledger/LedgerScreen.jsx";
import ReceiptPreviewScreen from "../screens/ledger/ReceiptPreviewScreen.jsx";
import TransactionDetailsScreen from "../screens/ledger/TransactionDetailsScreen.jsx";

const Stack = createNativeStackNavigator();

export default function LedgerStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="LedgerHome" component={LedgerScreen} />
            <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} />
            {/* A modal for the receipt preview */}
            <Stack.Screen
                name="ReceiptPreview"
                component={ReceiptPreviewScreen}
                options={{ presentation: "modal" }}
            />
        </Stack.Navigator>
    );
}