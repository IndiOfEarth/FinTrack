import { supabase } from "./supabaseClient"; // Use the supabase client. Includes auth + sesion automatically

// IMPORTANT - This is the backbone of the ledger. 
// IMPORTANT - Contains all CRUD operations

// Gets all the transactions for the current user logged-in
// The MAIN READ function for spending screens, dashboards, transaction lists.
export async function getTransactions() {
    // Supabase always returns data and error if something goes wrong.
    // Query the transactions table
    // For the current user's id, get the tranaction id, type, amount, date, note, receipt_path
    // Join the categories table (transactions.category_id links to categories.id) to get transaction's category
    // Order the results by date.
    const { data, error } = await supabase
    .from("transactions") 
    .select(`
        id,
        type,
        amount,
        date,
        note,
        receipt_path,
        category:categories (
            id,
            name,
            icon
        )
    `)
    .order("date", { ascending: false });

    if (error) throw error;
    return data; // return queried rows of data.
}

// CREATE/ADD a new transaction
export async function addTransaction(payload) {
    // Gets the current user
    const {
        data: { user },
        error: userErr
    } = await supabase.auth.getUser();

    if (userErr) throw userErr;
    if (!user) throw new Error("Not logged in.");

    // Function inserts a new transaction into the database, automatically attaching it ot the currently logged-in user.
    // returns the new row's ID, which is useful for attaching the receipt
    const { data, error } = await supabase.from("transactions").insert({ ...payload, user_id: user.id }).select("id").single();

    // if there is an error return the message
    if (error) throw error;
    return data;
}

// DELETE a transaction
export async function deleteTransaction(id) {
    // deletes by id of the specific transaction
    const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);
    
    if (error) throw error;
}

// updates a particular transaction so it stores the path of its uploaded receipt image
// the "transactionId" is provided to this function as an input parameter
// a "receiptPath" is also provided too 
export async function updateTransactionReceipt(transactionId, receiptPath) {
    const { error } = await supabase.from("transactions").update({ receipt_path: receiptPath }).eq("id", transactionId);

    if (error) throw error;
}

// For getting transactions for a month
export async function getTransactionsForMonth(monthKey) {
    // monthKey: "YYYY-MM"
    const start = `${monthKey}-01`;
    const endDateObj = new Date(`${monthKey}-01`);
    endDateObj.setMonth(endDateObj.getMonth() + 1);
    const end = endDateObj.toISOString().slice(0, 10); // YYYY-MM-DD

    const { data, error } = await supabase
        .from("transactions")
        .select(`
        id,
        user_id,
        type,
        amount,
        date,
        note,
        receipt_path,
        created_at,
        category:categories(id, name, icon)
        `)
        .gte("date", start)
        .lt("date", end)
        .order("date", { ascending: false });

    if (error) throw error;
    return data ?? [];
}