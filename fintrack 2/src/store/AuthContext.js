import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "../services/supabaseClient";

// What the Auth Context does?
// AuthContext broadcasts user data and login tools to the entire app.
// AuthProvider transmits, ensuring every component can listen for this data and access auth features instantly without manual hand-delivery (props)



// Creates a React Context - how data is shared globally across components without prop-drilling
// Reference - https://react.dev/reference/react/createContext
const AuthContext = createContext(null);

// Component wraps the app.
// Holds all auth state.
// Supplies auth functions and data to child components
export function AuthProvider({ children }) {
    // session - comes from Supabase
    // initialising - true while the app is checking if a user is already logged in
    const [session, setSession] = useState(null);
    const [initialising, setInitialising] = useState(true);

    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);

    // Runs once when the app starts
    useEffect(() => {
        // Gets the supabase session and checks:
        // Is someone already logged in. If yes, store the session. If no, keep as null
        // Does support app reloads, returning users, persistent login (not requiring each time returning to app)
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session ?? null);
            setInitialising(false);
        });
        
        // Listens for any auth changes
        // Particularly: signin, signout, token refresh, password reset
        const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession ?? null);
        });

        // A cleanup when the provider finishes running - to stop memory leaks
        return () => {
            subscription?.subscription?.unsubscribe?.();
        };
    }, []);

    // holds a users profile from Supabase and stores in state
    // take the userID, fetch the profile from Supabase profiles table, store in the profile state, handles loading
    const refreshProfile = useCallback(async (userId) => {
        // Check if the user exists
        if (!userId) {
            setProfile(null);
            return;
        }
        // Sets the profile loading state
        setProfileLoading(true);
        // Query database
        const { data, error } = await supabase.from("profiles")
            .select("id, display_name, currency, has_seen_onboarding, has_seen_tooltips, tooltips_seen")
            .eq("id", userId)
            .single();

        setProfileLoading(false);
        if (error) throw error;
        setProfile(data);
    }, []);

    // runs when session logged in user changes
    // loads their profile
    useEffect(() => {
        const userId = session?.user?.id; // extracts the user id from the session
        // if there is no clear user id, clear the profile state, and stop immediately
        if (!userId) {
            setProfile(null);
            return;
        }
        // if profile fetch fails, clear the profile
        refreshProfile(userId).catch(() => {
            setProfile(null);
        });
    }, [session?.user?.id, refreshProfile]);

    // updates the logged-in user's profile in the database and then updates react state with the new version
    // gets the current user ID, updates their row in profiles, saves the updated profile into state
    const updateProfile = useCallback(async (patch) => {
        const userId = session?.user?.id;
        if (!userId) throw new Error ("No user session");

        const { data, error } = await supabase.from("profiles")
            .update(patch)
            .eq("id", userId)
            .select("id, display_name, currency, has_seen_onboarding, has_seen_tooltips, tooltips_seen")
            .single();

        if (error) throw error;
        setProfile(data);
        return data;
    }, [session?.user?.id]);

    // useMemo - for caching the result of a calculation between re-renders
    // in this case, everything inside value remains and is only recreated when 'session'/'initialising' status changes
    // Reference - https://react.dev/reference/react/useMemo
    // Reference - https://dev.to/ayoashy/understanding-reacts-usememo-what-it-does-when-to-use-it-and-best-practices-4gdh#:~:text=What%20is%20useMemo%20?,unnecessary%20calculations%20and%20improve%20performance.&text=In%20this%20example%2C%20the%20function,use%20the%20previously%20memoized%20result.
    // Value is exposed and is what other components access
    const value = useMemo(() => ({
        // UNPACKING WHAT IS ACCESSIBLE TO OTHER COMPONENTS
        // session - the raw supabase session object
        // user - the logged-in user
        // initialising - lets the screens know that auth is still loading - wait. Useful for splash screens.
        // signIn - logs user in, while supabase handles validation, tokens, session storage
        // signUp - creates a new auth user - database trigger created in supabase creates the row also in profiles table
        // signOut - clears the current session. Triggers an auth change listener.
        session,
        user: session?.user ?? null,
        initialising,

        profile,
        profileLoading,
        refreshProfile: () => refreshProfile(session?.user?.id),
        updateProfile,

        signIn: async (email, password) => {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            return data;
        },
        signUp: async (email, password, displayName) => {
            // fullName is stored in profiles too as additional metadata
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { display_name: displayName }
                }
            });
            if (error) throw error;

            // 2) If we already have the user id, write to profiles
            const userId = data?.user?.id;
            if (userId) {
                const { error: profileError } = await supabase
                    .from("profiles")
                    .upsert(
                        { id: userId, display_name: displayName },
                        { onConflict: "id" }
                );
                if (profileError) throw profileError;
            }
            return data; // returns new user's information is successful
        },
        signOut: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        },
    }), [session, initialising, profile, profileLoading, refreshProfile, updateProfile]);

    // makes auth available to the entire app tree
    // wrapped around navigation in App.js so all child components have access to the context
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}