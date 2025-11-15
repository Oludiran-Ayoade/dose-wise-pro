import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Code2 } from "lucide-react";
import { ProblemDisplay } from "@/components/ProblemDisplay";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TestCase {
  name: string;
  code: string;
  difficulty: "easy" | "hard";
}

interface Problem {
  title: string;
  description?: string; // backward compatibility
  readme?: string; // new format
  baseCode: string;
  solution: string;
  testCases: TestCase[];
}

const Index = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);

  const generateProblem = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-challenge');
      
      if (error) throw error;
      
      setProblem(data);
      toast.success("Challenge generated successfully!");
    } catch (error: any) {
      console.error("Error generating problem:", error);
      toast.error(error.message || "Failed to generate challenge. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Challenge Generator</h1>
          </div>
          <div className="text-xs text-muted-foreground">
            Powered by Loki AI
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary animate-pulse-glow" />
            <span className="text-sm font-medium text-primary">AI-Powered Problem Generation</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Generate Real-World Coding Challenges
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create realistic coding problems with proper test distribution. 
            Each challenge includes a README, base code, solution, and comprehensive test suite designed for AI evaluation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              size="lg"
              onClick={generateProblem}
              disabled={isGenerating}
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Challenge
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="text-2xl font-bold text-primary mb-1">10-15%</div>
              <div className="text-xs text-muted-foreground">Easy Tests</div>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="text-2xl font-bold text-accent mb-1">80-85%</div>
              <div className="text-xs text-muted-foreground">Hard Tests</div>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="text-2xl font-bold text-foreground mb-1">100%</div>
              <div className="text-xs text-muted-foreground">Fair & Clear</div>
            </div>
          </div>
        </div>

        {/* Problem Display */}
        {problem && (
          <div className="max-w-6xl mx-auto">
            <ProblemDisplay problem={problem} />
          </div>
        )}

        {/* Info Cards */}
        {!problem && (
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 mt-12">
            <div className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
              <h3 className="text-lg font-semibold text-foreground mb-2">Real-World Context</h3>
              <p className="text-sm text-muted-foreground">
                Every challenge includes realistic scenarios from domains like healthcare, finance, or e-commerce - just like actual GitHub issues.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
              <h3 className="text-lg font-semibold text-foreground mb-2">Balanced Difficulty</h3>
              <p className="text-sm text-muted-foreground">
                Test distribution ensures some baseline tests pass while the majority challenge the AI model's capabilities.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Built for Loki AI Challenge Platform
        </div>
      </footer>
    </div>
  );
};

export default Index;
