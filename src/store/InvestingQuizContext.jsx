// InvestingQuizContext.jsx
// Manages global state for the Investing Quiz feature using React Context.
// Reference: https://react.dev/reference/react/useContext

import React, { createContext, useContext, useMemo, useState } from "react";

// Create a new context object
const Ctx = createContext(null);

// Initial state for quiz answers
// Defines the structure of all quiz responses and the choices that the user can make

// Writing here what the choices could be
// investorType: "new" | "casual" | "confident" | "experienced"
// risk: "low" | "medium" | "high" | "yolo"
// industries: ["tech","ai","health","energy","finance","consumer"]
// style: "bluechip" | "balanced" | "growth"

const initial = {
  investorType: null,
  risk: null,
  industries: [],
  style: null,
};

// Provider component
// Wraps quiz screens so they can access and update shared quiz state
export function InvestingQuizProvider({ children }) {
  const [answers, setAnswers] = useState(initial);

  // useMemo prevents unnecessary re-renders
  // It recalculates only when 'answers' changes
  const value = useMemo(
    () => ({
      answers,
      setAnswers,
      reset: () => setAnswers(initial),
    }),
    [answers],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// Custom hook for accessing quiz context safely
export function useInvestingQuiz() {
  const ctx = useContext(Ctx);

  // Ensures the hook is used inside the Provider
  if (!ctx)
    throw new Error(
      "useInvestingQuiz must be used within InvestingQuizProvider",
    );

  return ctx;
}
