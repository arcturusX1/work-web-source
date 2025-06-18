
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, userType: 'creator' | 'client') => {
    // Special handling for admin account - use a different email that passes validation
    const isAdminAttempt = email === 'admin@freelancehub.com';
    const actualEmail = isAdminAttempt ? 'admin@example.com' : email;
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email: actualEmail,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          user_type: userType,
          original_email: isAdminAttempt ? 'admin@freelancehub.com' : email
        }
      }
    });

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }

    toast({
      title: "Success!",
      description: isAdminAttempt 
        ? "Admin account created successfully! You can now sign in directly." 
        : "Please check your email to confirm your account."
    });

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    // Handle admin login with the actual stored email
    const actualEmail = email === 'admin@freelancehub.com' ? 'admin@example.com' : email;
    
    const { error } = await supabase.auth.signInWithPassword({
      email: actualEmail,
      password
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }

    // Special handling for admin login
    if (email === 'admin@freelancehub.com') {
      toast({
        title: "Admin login successful",
        description: "Welcome to the admin dashboard!"
      });
    }

    return { error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive"
      });
    }
    return { error };
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut
  };
}
