import { supabase } from "./supabaseClient"; // imports the pre-configured supabase connection

// Read categories so the Add Transaction screen can show them

// export - other files can import this
// async - the function talks to the network
export async function getCategories() {
    // supabase query that returns the data and error if something went wrong
    // SELECT * FROM CATEGORIES
    // ORDER BY created_at ASCENDING true
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data; // returns an array of category objects
}