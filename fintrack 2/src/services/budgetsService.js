import { supabase } from "./supabaseClient";

// Handles the monthly spending limits per category

// Gets the budgets for the specific month
export async function getBudgetsForMonth(monthStartDate) {
    // gets the budgets table
    // only returns the id, category_id, month, and limit_amount columns
    // filters only to the monthStart date
    const { data, error } = await supabase.from("budgets")
        .select(`
            id,
            category_id,
            month,
            limit_amount    
        `)
        .eq("month", monthStartDate);

    if (error) throw error;
    return data ?? []; // if nothing exists, just return an empty array
}

// Creates or updates a budget
// when a budget exists, update it
// if it doesn't exist, create it
export async function upsertBudget({ categoryId, monthStartDate, limitAmount}) {
    // Get the current user
    const { data: { user }, error: userErr } = await supabase.auth.getUser();

    if (userErr) throw userErr;
    if (!user) throw new Error("Not logged in.");

    // The budgets table has a unique constraint
    // creates a budget if it doesn't exist (in the budgets table)
    // only one budget per user per category per month - benefit of upsert is that it doesn't allow more than one
    // REFERENCE - https://neon.com/postgresql/postgresql-tutorial/postgresql-upsert
    const { error } = await supabase.from("budgets")
        .upsert({
            user_id: user.id,
            category_id: categoryId,
            month: monthStartDate,
            limit_amount: Number(limitAmount)
        });
    
    if (error) throw error;
}

// Deletes a budget
export async function deleteBudget({ categoryId, monthStartDate }) {
    // .eq for filtering (WHERE statement in SQL)
    const { error } = await supabase.from("budgets")
        .delete()
        .eq("category_id", categoryId)
        .eq("month", monthStartDate);
    
    if (error) throw error;
}