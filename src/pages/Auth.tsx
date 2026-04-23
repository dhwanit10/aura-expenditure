import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(72),
});

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = mode === "signin" ? "Sign in — Aura" : "Create account — Aura";
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/", { replace: true });
    });
  }, [mode, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast.success("Welcome! Account created.");
        navigate("/", { replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        toast.success("Welcome back ✨");
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/4 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-primary/30 blur-3xl animate-float" />
        <div className="absolute bottom-10 right-1/4 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-secondary/25 blur-3xl animate-pulse-glow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-48 sm:w-72 h-48 sm:h-72 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <section className="w-full max-w-md glass-card p-6 sm:p-10 grain relative animate-scale-in">
        <header className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-3">Aura · Ledger</p>
          <h1 className="font-display text-5xl text-gradient-warm leading-none">
            {mode === "signin" ? "Welcome back" : "Begin"}
          </h1>
          <p className="text-muted-foreground mt-3">
            {mode === "signin" ? "Your finances, glowing again." : "Track your aura, in colour."}
          </p>
        </header>

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@aura.app"
              className="bg-surface-glow border-border/40 h-12 rounded-xl focus-visible:ring-primary"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-surface-glow border-border/40 h-12 rounded-xl focus-visible:ring-primary"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-12 rounded-xl bg-gradient-warm text-primary-foreground font-semibold tracking-wide hover:opacity-90 glow-peach mt-2"
          >
            {loading ? "…" : mode === "signin" ? "Enter" : "Create account"}
          </Button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 w-full text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {mode === "signin" ? "No account? " : "Already have one? "}
          <span className="text-accent underline-offset-4 hover:underline">
            {mode === "signin" ? "Create one" : "Sign in"}
          </span>
        </button>
      </section>
    </main>
  );
};

export default Auth;
