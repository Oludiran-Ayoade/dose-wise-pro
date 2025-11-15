import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TestCase {
  name: string;
  code: string;
  difficulty: "easy" | "hard";
}

interface Problem {
  title: string;
  description: string;
  baseCode: string;
  solution: string;
  testCases: TestCase[];
}

interface ProblemDisplayProps {
  problem: Problem;
}

export const ProblemDisplay = ({ problem }: ProblemDisplayProps) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const easyTests = problem.testCases.filter(t => t.difficulty === "easy");
  const hardTests = problem.testCases.filter(t => t.difficulty === "hard");
  const allTestsCode = problem.testCases.map(t => t.code).join("\n\n");

  return (
    <div className="w-full animate-slide-up">
      <Card className="border-border bg-card shadow-lg">
        <div className="border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-4">
          <h2 className="text-2xl font-bold text-foreground">{problem.title}</h2>
        </div>

        <Tabs defaultValue="readme" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b border-border bg-muted/30 p-0">
            <TabsTrigger 
              value="readme" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              README
            </TabsTrigger>
            <TabsTrigger 
              value="base-code"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Base Code
            </TabsTrigger>
            <TabsTrigger 
              value="solution"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Solution
            </TabsTrigger>
            <TabsTrigger 
              value="tests"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Tests ({easyTests.length} easy, {hardTests.length} hard)
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="readme" className="mt-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Problem Description</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(problem.description, "readme")}
                  className="gap-2"
                >
                  {copiedSection === "readme" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Copy
                </Button>
              </div>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap rounded-lg bg-code-bg border border-code-border p-4 text-sm text-foreground font-mono">
                  {problem.description}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="base-code" className="mt-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Scaffold Code</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(problem.baseCode, "base-code")}
                  className="gap-2"
                >
                  {copiedSection === "base-code" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Copy
                </Button>
              </div>
              <pre className="overflow-x-auto rounded-lg bg-code-bg border border-code-border p-4 text-sm text-foreground font-mono">
                {problem.baseCode}
              </pre>
            </TabsContent>

            <TabsContent value="solution" className="mt-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Complete Solution</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(problem.solution, "solution")}
                  className="gap-2"
                >
                  {copiedSection === "solution" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Copy
                </Button>
              </div>
              <pre className="overflow-x-auto rounded-lg bg-code-bg border border-code-border p-4 text-sm text-foreground font-mono">
                {problem.solution}
              </pre>
            </TabsContent>

            <TabsContent value="tests" className="mt-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Test Suite: {easyTests.length} easy (baseline) + {hardTests.length} hard (challenging)
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(allTestsCode, "tests")}
                  className="gap-2"
                >
                  {copiedSection === "tests" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Copy All
                </Button>
              </div>
              <div className="space-y-4">
                {easyTests.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-500">
                        Easy Tests ({easyTests.length})
                      </span>
                      <span className="text-xs text-muted-foreground">~10-15% pass rate</span>
                    </div>
                    {easyTests.map((test, idx) => (
                      <pre key={idx} className="overflow-x-auto rounded-lg bg-code-bg border border-code-border p-4 text-sm text-foreground font-mono mb-2">
                        {test.code}
                      </pre>
                    ))}
                  </div>
                )}
                {hardTests.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-500">
                        Hard Tests ({hardTests.length})
                      </span>
                      <span className="text-xs text-muted-foreground">~80-85% challenge rate</span>
                    </div>
                    {hardTests.map((test, idx) => (
                      <pre key={idx} className="overflow-x-auto rounded-lg bg-code-bg border border-code-border p-4 text-sm text-foreground font-mono mb-2">
                        {test.code}
                      </pre>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
};
