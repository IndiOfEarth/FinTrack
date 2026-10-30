import React, { useCallback, useMemo, useState } from "react";
import { View, Text, TextInput, Alert, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

// Get the screens
import Screen from "../../components/common/Screen.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import { theme } from "../../theme/theme";

// Utilities and services that help with budgets
import { getCategories } from "../../services/categoriesServices";
import { getBudgetsForMonth, upsertBudget, deleteBudget } from "../../services/budgetsService";
import { getMonthStartDate, getMonthKey } from "../../utils/finance";

export default function BudgetsScreen() {
    // State variables. 
    const [categories, setCategories] = useState([]); // list of the user's categories (Food, Travel, etc.)
    const [budgets, setBudgets] = useState([]); // Budgets already saved in the DB for the month
    const [inputs, setInputs] = useState({}); // What the user is typing into the text boxes
    const [loading, setLoading] = useState(true); // Show "Loading" while fetching

    const monthStart = getMonthStartDate(new Date()); // the value stored/queried in the budgets.month column
    const monthKey = getMonthKey(new Date()); // for displaying the month as "YYYY-MM"

    // Turns the budgets into a fast dictionary
    // Takes the array of budgets and maps them to category_id -> budget_row
    // Done as useMemo so that it only remaps if there is a change to the budgets
    const budgetMap = useMemo(() => {
        const m = new Map();
        for (const b of budgets) m.set(b.category_id, b);
        return m;
    }, [budgets]);

    // Fetches the budgets and categories
    // Stores them in state
    // Pre-fills the text inputs with existing budget values
    const load = useCallback(async () => {  
        // Create the 'load' function and only recreate it if monthStart changes
        try {
            setLoading(true); // tells the UI that fetching data
            // Runs two requests in parallel
            // Fetches categories and budgets at the same time
            // Promise command is completion of asynchronous operation(s) and the resulting values.
            // Works like a multi-tasking command, which is useful here as need to do two different things from Supabase
            // REFERENCE - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
            const [cats, buds] = await Promise.all([
                getCategories(),
                getBudgetsForMonth(monthStart)
            ]);

            // Stores the values in state
            // Screen has the list of categories and existing budgets
            setCategories(cats?? []);
            setBudgets(buds ?? []); 

            // Pre-fill inputs with existing budget values
            const nextInputs = {};
            for (const c of cats ?? []) {
                const b = (buds ?? []).find((x) => x.category_id === c.id);
                nextInputs[c.id] = b ? String(b.limit_amount) :  "";
            }   
            setInputs(nextInputs);
        }
        catch (e) {
            Alert.alert("Error", e.message);
        }
        finally {
            setLoading(false);
        }
    }, [monthStart]);

    // Used by react navigation
    // Every time this screen becomes active (focused), run load()
    useFocusEffect(
        useCallback(() => {
            load(); // will reload the screen when screen comes into focus - also refreshing categories and their budgets
        }, [load])
    );

    const setInput = (categoryId, value) => {
        // copies everything inside prev (...prev)
        // and updates the category key and value
        setInputs((prev) => ({ ...prev, [categoryId]: value }));
    };

    // When the user presses "save"
    // Saves to database provided it is valid
    // Refreshes the screen
    const saveBudget = async (categoryId) => {
        const raw = inputs[categoryId]; // gets the typed value from the state
        const num = Number(raw); // converts to a number

        // Validates the input (otherwise sends an alert)
        if (!raw || Number.isNaN(num) || num <= 0) {
            return Alert.alert("Invalid budget", "Enter a number greater than 0.");
        }

        try {
            // Try saving to the database
            await upsertBudget({
                categoryId,
                monthStartDate: monthStart,
                limitAmount: num
            });
            Alert.alert("Saved", "Budget updated.");
            load();
        }
        catch (e) {
            Alert.alert("Save failed", e.message);
        }
    };

    // Clearing a budget
    // Deletes the row from the DB for that category + month
    // Clears the text input locally
    // Reloads everyhing
    const clearBudget = async (categoryId) => {
        try {
            // Tries to delete the budget from the budgets table
            await deleteBudget({ categoryId, monthStartDate: monthStart });
            setInput(categoryId, "");
            Alert.alert("Removed", "Budget cleared.");
            load();
        }
        catch (e) {
            Alert.alert("Remove failed", e.message);
        }
    };

    return (
        <Screen>
            {/* Scrollview to contain all budget information */}
            <ScrollView contentContainerStyle={{ padding: theme.spacing.screen, gap: 12 }}>
                {/* Title labels */}
                <Text style={{ fontSize: 26, fontWeight: "800", color: theme.colors.text }}>Budgets</Text>
                <Text style={{ color: theme.colors.muted }}>Month: {monthKey}</Text>

                {loading ? (
                    <Text style={{ color: theme.colors.muted }}>Loading...</Text>
                ) : (
                    categories.map((c) => {
                        const existing = budgetMap.get(c.id);

                        return (
                        <Card key={c.id}>
                            <Text style={{ color: theme.colors.text, fontWeight: "800", marginBottom: 10 }}>
                                {c.icon ? `${c.icon} ` : ""}
                                {c.name}
                            </Text>

                            <Input
                                placeholder="Monthly limit (e.g. 200)"
                                placeholderTextColor="#777"
                                keyboardType="decimal-pad"
                                value={inputs[c.id] ?? ""}
                                onChangeText={(t) => setInput(c.id, t)}
                                style={{
                                    borderWidth: 1,
                                    borderColor: theme.colors.border,
                                    borderRadius: theme.radius.md,
                                    padding: 12,
                                    color: theme.colors.text,
                                    backgroundColor: "rgba(255,255,255,0.03)",
                                }}
                            />

                            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                            <Button
                                title="Save"
                                onPress={() => saveBudget(c.id)}
                                style={{ flex: 1 }}
                            />
                            <Button
                                title={existing ? "Clear" : "Clear"}
                                variant="secondary"
                                onPress={() => clearBudget(c.id)}
                                style={{ flex: 1 }}
                            />
                            </View>

                            {existing ? (
                            <Text style={{ color: theme.colors.muted, fontSize: 12, marginTop: 8 }}>
                                Current limit: {existing.limit_amount}
                            </Text>
                            ) : (
                            <Text style={{ color: theme.colors.muted, fontSize: 12, marginTop: 8 }}>
                                No budget set yet.
                            </Text>
                            )}
                        </Card>
                        );
                    })
                )}
            </ScrollView>
        </Screen>
    );
}