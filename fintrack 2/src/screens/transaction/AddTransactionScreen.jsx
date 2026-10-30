import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import styling and themes
import Screen from "../../components/common/Screen.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import { theme } from "../../theme/theme";

// These talk to Supabase
import { getCategories } from "../../services/categoriesServices";
import {
  addTransaction,
  updateTransactionReceipt,
} from "../../services/transactionsService";
import { uploadReceipt } from "../../services/receiptsService";

// Removes the time from the date string.
// 1. User will pick a date using DateTimePicker
// 2. A JS Date object is then passed into this toISODateOnly() function
// 3. Result is sent to addtransaction()
// 4. stored by Postgres
function toISODateOnly(dateObj) {
  // Store as YYYY-MM-DD for Postgres date type
  const yyyy = dateObj.getFullYear(); // get the year
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`; // returns ISO date string
}

// This screen lets a logged-in user create a new transaction and save it to the database

// 1. Holds the format state (amount, date, category, etc.)
// 2. Loads categories from Supabase
// 3. Lets the user pick values
// 4. Validates the form
// 5. Save the transaction via the service.

export default function AddTransactionScreen({ navigation }) {
  // State
  const [type, setType] = useState("expense"); // Is the transaction an expense or income
  const [amount, setAmount] = useState(""); // The amount typed by the user
  const [note, setNote] = useState(""); // Any optional notes typed by the user
  const [dateObj, setDateObj] = useState(new Date()); // JS Date object for the transaction date
  const [showDatePicker, setShowDatePicker] = useState(false); // Decides whether the date picker is visible
  const [categories, setCategories] = useState([]); // list of categories loaded from Supabase
  const [categoryId, setCategoryId] = useState(null); // which one the user picked
  const [loading, setLoading] = useState(false); // prevents the double saves and updates the next button

  // Receipt / camera state variables
  const [receiptUri, setReceiptUri] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState(null);

  const insets = useSafeAreaInsets();

  // Looks for the selected category object based on categoryId
  // useMemo - whenever it changes
  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === categoryId),
    [categories, categoryId],
  );

  // Runs once (useEffect, []) when the screen opens
  // Loads the categories
  useEffect(() => {
    let mounted = true; // stops action when leaving screen or reloading to prevent memory leak
    (async () => {
      try {
        const data = await getCategories();
        if (!mounted) return;
        setCategories(data); // store the retrieved categores in state
        // populate the form with a default category (first item) to stop empty form
        if (data?.length && !categoryId) setCategoryId(data[0].id);
      } catch (e) {
        Alert.alert("Error", e.message);
      }
    })();

    // Just some defensive coding to stop any errors if still going after reload
    return () => {
      mounted = false;
    };
  }, []);

  // form validation function to check amounts and category before saving
  const validate = () => {
    const n = Number(amount);
    // if there is no amount set
    if (!amount || Number.isNaN(n) || n <= 0)
      return "Enter a valid amount greater than 0.";
    // if there is not category id or invalid
    if (!categoryId) return "Please select a category.";
    return null;
  };

  // Check if the app has permission to use the camera
  // If not require permission
  // If permission granted, open the camera
  // Otherwise, show an alert
  const openCamera = async () => {
    // ? - this prevents crashes if permission is undefined
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert(
          "Camera permission needed",
          "Please allow camera access to take receipt photos.",
        );
        return;
      }
    }
    setShowCamera(true); // camera state variable - true - so should be shown
  };

  // Function takes a photo using the camera, saves its file path in state and closes the camera view.
  const takePhoto = async () => {
    if (!cameraRef) return;
    const photo = await cameraRef.takePictureAsync({ quality: 0.7 });
    setReceiptUri(photo.uri);
    setShowCamera(false);
  };

  // function to save transaction form data to the transactions table in supabase
  const handleSave = async () => {
    const err = validate();
    if (err) return Alert.alert("Check your form", err);

    // Using try block for defensive coding
    try {
      setLoading(true); // now loading
      // 1) Create transaction row (get id back)
      const created = await addTransaction({
        type,
        amount: Number(amount),
        category_id: categoryId,
        date: toISODateOnly(dateObj),
        note: note?.trim() || null,
      });

      // REFERENCE - https://www.w3schools.com/js/js_async.asp
      // await - tells the code to pause and wait for transaction to finish before moving on
      // 2) If a receipt was captured, upload to Storage and save receipt_path
      if (receiptUri) {
        const receiptPath = await uploadReceipt({
          localUri: receiptUri,
          transactionId: created.id,
        });

        await updateTransactionReceipt(created.id, receiptPath);
      }

      // Gives user a physical success vibration.
      // REFERENCE - https://docs.expo.dev/versions/latest/sdk/haptics/
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Reset form afterwards
      setAmount("");
      setNote("");
      setDateObj(new Date());
      setReceiptUri(null);

      Alert.alert("Saved", "Transaction added.");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Save failed", e.message);
    } finally {
      setLoading(false); // Stop loading afterwards
    }
  };

  // Camera screen
  if (showCamera) {
    return (
      <Screen>
        <View style={{ flex: 1 }}>
          <CameraView style={{ flex: 1 }} ref={(ref) => setCameraRef(ref)} />
          <View
            style={{ padding: 16, gap: 10, backgroundColor: theme.colors.bg }}
          >
            <Button title="Take Photo" onPress={takePhoto} />
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => setShowCamera(false)}
            />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.screen,
          paddingTop: 30,
          paddingBottom: 140, // space so content doesn't hide behind footer
          gap: 14,
        }}
      >
        <Text
          style={{
            fontSize: 26,
            fontWeight: "800",
            color: theme.colors.text,
            textAlign: "center",
          }}
        >
          Add Transaction
        </Text>

        <Card>
          <Text style={{ color: theme.colors.muted, marginBottom: 10 }}>
            Type
          </Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Button
              title="Expense"
              variant={type === "expense" ? "primary" : "secondary"}
              onPress={() => setType("expense")}
              style={{ flex: 1 }}
            />
            <Button
              title="Income"
              variant={type === "income" ? "primary" : "secondary"}
              onPress={() => setType("income")}
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        <Card>
          <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
            Amount
          </Text>
          <Input
            placeholder="e.g. 12.50"
            placeholderTextColor="#777"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              padding: 12,
              color: theme.colors.text,
              backgroundColor: "rgba(255,255,255,0.03)",
            }}
          />
        </Card>

        <Card>
          <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
            Category
          </Text>

          <View style={{ gap: 10 }}>
            {categories.map((c) => {
              const selected = c.id === categoryId;
              return (
                <Button
                  key={c.id}
                  title={`${c.icon ? c.icon + " " : ""}${c.name}`}
                  variant={selected ? "primary" : "secondary"}
                  onPress={() => setCategoryId(c.id)}
                />
              );
            })}
          </View>

          {selectedCategory && (
            <Text
              style={{ marginTop: 10, color: theme.colors.muted, fontSize: 12 }}
            >
              Selected: {selectedCategory.name}
            </Text>
          )}
        </Card>

        <Card>
          <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
            Date
          </Text>
          <Button
            title={toISODateOnly(dateObj)}
            variant="secondary"
            onPress={() => setShowDatePicker(true)}
          />

          {showDatePicker && Platform.OS === "ios" ? (
            <Card style={{ padding: 12 }}>
              <DateTimePicker
                value={dateObj}
                mode="date"
                display="spinner"
                themeVariant="dark"
                textColor={theme.colors.text}
                onChange={(_, selected) => {
                  if (selected) setDateObj(selected);
                }}
              />
              <View style={{ marginTop: 10 }}>
                <Button title="Done" onPress={() => setShowDatePicker(false)} />
              </View>
            </Card>
          ) : showDatePicker ? (
            <DateTimePicker
              value={dateObj}
              mode="date"
              display="default"
              onChange={(_, selected) => {
                setShowDatePicker(false);
                if (selected) setDateObj(selected);
              }}
            />
          ) : null}
        </Card>

        <Card>
          <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
            Notes (optional)
          </Text>
          <Input
            placeholder="e.g. Netflix subscription"
            placeholderTextColor="#777"
            value={note}
            onChangeText={setNote}
            autoCorrect={false}
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              padding: 12,
              color: theme.colors.text,
              backgroundColor: "rgba(255,255,255,0.03)",
            }}
          />
        </Card>

        <Button
          title={receiptUri ? "✅ Receipt added" : "📷 Add Receipt"}
          variant="secondary"
          onPress={openCamera}
        />

        {/* ✅ Sticky footer */}
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: theme.spacing.screen,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 12),
            backgroundColor: theme.colors.base,
            borderTopWidth: 1,
            borderTopColor: "rgba(255,255,255,0.06)",
          }}
        >
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => {
                setType("expense");
                setAmount("");
                setNote("");
                setDateObj(new Date());
                setReceiptUri(null);
              }}
              style={{ flex: 1 }}
              disabled={loading}
            />
            <Button
              title={loading ? "Saving..." : "Save"}
              onPress={handleSave}
              style={{ flex: 1 }}
              disabled={loading}
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
