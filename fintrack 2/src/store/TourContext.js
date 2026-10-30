// PURPOSE - The guided tour with tooltips of the app
// When the user signs up
// Decides whether the tooltip tour is running
// Which step is the user on
// When it should start automatically
// When it's marked as completed.

import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

// context is like a global container
const TourContext = createContext(null);

export function TourProvider({ children }) {
    // Tour system depends on profile.has_seen_tooltips and profile.has_seenonboarding
    // Tour state is synced to database
    const { profile, updateProfile } = useAuth();
    const [step, setStep] = useState(null); // step state so Tour knows which step/screen to be on

    const start = useCallback(() => setStep(0), []); // Tour begins at step 0
    const stop = useCallback(() => setStep(null), []); /// Stops the tour immediately

    // Updates the database and stops the tour (so has_seen_tooltips is true)
    // Needs to do this so the tour won't show again next time
    const complete = useCallback(async () => {
        await updateProfile({ has_seen_tooltips: true });
        setStep(null);
    }, [updateProfile]);

    // start automatically if profile exists, user has not seen tooltips, and user has completed onboarding
    const shouldAutoStart = !!profile && profile.has_seen_tooltips === false && profile.has_seen_onboarding === true;

    // Creates a global object storing all states that is shared
    // useMemo to prevent the object (and its data inside) being recreated on every render
    // only recreates it if one of the following changes: [step, start, stop, complete, shouldAutoStart]
    const value = useMemo(() => ({
        step,
        setStep,
        start,
        stop,
        complete,
        shouldAutoStart
    }), [step, start, stop, complete, shouldAutoStart]);

    // Provide a context, so that the TourProvider component has access to tour controls
    // When <TourProvider> is used, everything inside (such as AppNavigator) can access the tour state
    return <TourContext.Provider value={value}>{children}</TourContext.Provider>
}


export function useTour() {
    // finds nearest tourcontext.provider, grabs value, returns that object
    const ctx = useContext(TourContext);
    if (!ctx) throw new Error("useTour must be used within TourProvider");
    return ctx
}