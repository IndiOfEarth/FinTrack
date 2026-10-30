// PURPOSE of screen
// When the user taps the transaction, it takes them to a detailed transaction screen
import React, { useEffect, useState } from "react";
import { View, Text, Alert } from "react-native";

// Screens and utility/service functions
import Screen from "../../components/common/Screen.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import { theme } from "../../theme/theme";
import { formatMoney, currencySymbol } from "../../utils/money";
import { getReceiptSignedUrl } from "../../services/receiptsService";
import { useAuth } from "../../store/AuthContext.js";

// {route, navigation} - screen receives data passed from previous screen (route)
// navigation - allows navigation back to previous screen and elsewhere around the app
export default function TransactionDetailsScreen({ route, navigation }) {
  const { transaction } = route.params || {}; // Extract transaction from the current route (passed from Navigation.navigate ({ transaction }))
  const [receiptUrl, setReceiptUrl] = useState(null); // This stores the temporary signed URL for the receipt image.

  const { profile } = useAuth();

  // Runs once when the screen loads
  useEffect(() => {
    // pre-load the signed URL
    (async () => {
      try {
        if (transaction?.receipt_path) {
          const url = await getReceiptSignedUrl(transaction.receipt_path);
          setReceiptUrl(url);
        }
      } catch (e) {}
    })();
  }, []);

  // if no transaction is clicked or exists/error
  if (!transaction) {
    return (
      <Screen>
        <Text style={{ color: theme.colors.text }}>No transaction found.</Text>
      </Screen>
    );
  }

  // if the transaction type is an expense
  const isExpense = transaction.type === "expense";

  // returning the UI
  return (
    <Screen>
      <View style={{ padding: theme.spacing.screen, gap: 12 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 22,
              fontWeight: "800",
            }}
          >
            Transaction
          </Text>
          <Button
            title="Close"
            variant="secondary"
            onPress={() => navigation.goBack()}
          />
        </View>

        <Card>
          <Text style={{ color: theme.colors.muted }}>Amount</Text>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 24,
              fontWeight: "900",
              marginTop: 6,
            }}
          >
            {isExpense ? "-" : "+"}
            {formatMoney(transaction.amount, currencySymbol(profile?.currency))}
          </Text>

          <View style={{ marginTop: 12, gap: 6 }}>
            <Text style={{ color: theme.colors.muted }}>
              Category:{" "}
              {transaction.category?.icon
                ? transaction.category.icon + " "
                : ""}
              {transaction.category?.name ?? "—"}
            </Text>
            <Text style={{ color: theme.colors.muted }}>
              Date: {transaction.date}
            </Text>
            <Text style={{ color: theme.colors.muted }}>
              Type: {transaction.type}
            </Text>
            <Text style={{ color: theme.colors.muted }}>
              Notes: {transaction.note ? transaction.note : "—"}
            </Text>
          </View>
        </Card>

        {transaction.receipt_path ? (
          <Card>
            <Text
              style={{
                color: theme.colors.text,
                fontWeight: "800",
                marginBottom: 10,
              }}
            >
              Receipt
            </Text>

            <Button
              title="View receipt"
              onPress={async () => {
                try {
                  const signedUrl =
                    receiptUrl ||
                    (await getReceiptSignedUrl(transaction.receipt_path));
                  navigation.navigate("ReceiptPreview", { signedUrl });
                } catch (e) {
                  Alert.alert("Could not load receipt", e.message);
                }
              }}
            />
          </Card>
        ) : (
          <Card>
            <Text style={{ color: theme.colors.muted }}>
              No receipt attached.
            </Text>
          </Card>
        )}
      </View>
    </Screen>
  );
}
