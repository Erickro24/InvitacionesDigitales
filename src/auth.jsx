import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, supabaseEnabled } from "./supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(supabaseEnabled);

  useEffect(() => {
    if (!supabaseEnabled) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    if (!supabaseEnabled) throw new Error("Configura Supabase para registrar usuarios.");
    return supabase.auth.signUp({ email, password });
  };

  const signIn = async (email, password) => {
    if (!supabaseEnabled) throw new Error("Configura Supabase para iniciar sesión.");
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    if (supabaseEnabled) await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, supabaseEnabled }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
