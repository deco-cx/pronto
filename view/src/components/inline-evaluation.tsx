import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { BarChart, Play, CheckCircle, AlertCircle } from "lucide-react";
import { useEvaluateIdea } from "../hooks/useEvaluation";
import { toast } from "sonner";

interface InlineEvaluationProps {
  ideaId: string;
  expandedData: any;
}

interface EvaluationCriteria {
  key: string;
  title: string;
  description: string;
  color: string;
}

const evaluationCriteria: EvaluationCriteria[] = [
  {
    key: "ambiguityAvoidance",
    title: "Ambiguity Avoidance",
    description: "How clear and unambiguous is the idea? (1-10)",
    color: "bg-[#86DEE8]/20 text-gray-800 border-[#86DEE8]/50"
  },
  {
    key: "interestLevel", 
    title: "Interest Level",
    description: "How interesting and engaging is this idea? (1-10)",
    color: "bg-[#A1C5F9]/20 text-gray-800 border-[#A1C5F9]/50"
  },
  {
    key: "marketPotential2025",
    title: "Market Potential 2025",
    description: "What's the market potential for this idea in 2025? (1-10)",
    color: "bg-[#FEE38B]/20 text-gray-800 border-[#FEE38B]/50"
  },
  {
    key: "technicalFeasibility",
    title: "Technical Feasibility", 
    description: "How technically feasible is this idea? (1-10)",
    color: "bg-[#86DEE8]/30 text-gray-800 border-[#86DEE8]/60"
  },
  {
    key: "innovationLevel",
    title: "Innovation Level",
    description: "How innovative and novel is this idea? (1-10)",
    color: "bg-[#A1C5F9]/30 text-gray-800 border-[#A1C5F9]/60"
  },
  {
    key: "userValueProposition",
    title: "User Value Proposition",
    description: "How valuable is this to end users? (1-10)",
    color: "bg-[#FEE38B]/30 text-gray-800 border-[#FEE38B]/60"
  }
];

export function InlineEvaluation({ ideaId, expandedData }: InlineEvaluationProps) {
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const evaluateMutation = useEvaluateIdea();

  const handleRunEvaluation = async () => {
    try {
      const result = await evaluateMutation.mutateAsync({
        ideaId,
        expandedData
      });
      
      setEvaluationResult(result);
      toast.success("Evaluation completed successfully!");
    } catch (error) {
      toast.error("Failed to run evaluation");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600 bg-green-100";
    if (score >= 6) return "text-yellow-600 bg-yellow-100";
    if (score >= 4) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 7) return <CheckCircle className="w-4 h-4 text-green-600" />;
    return <AlertCircle className="w-4 h-4 text-orange-600" />;
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5 text-gray-700" />
              Idea Evaluation
            </CardTitle>
            <CardDescription>
              AI-powered evaluation across multiple criteria to assess your idea's potential
            </CardDescription>
          </div>
          <Button
            onClick={handleRunEvaluation}
            disabled={evaluateMutation.isPending}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {evaluateMutation.isPending ? "Evaluating..." : "Run Evaluation"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Evaluation Criteria Preview */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Evaluation Criteria</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {evaluationCriteria.map((criterion) => (
              <div
                key={criterion.key}
                className={`p-3 rounded-lg border ${criterion.color}`}
              >
                <h4 className="font-medium text-sm">{criterion.title}</h4>
                <p className="text-xs mt-1 opacity-80">{criterion.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation Results */}
        {evaluationResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-green-800">Evaluation Results</h3>
              <Badge variant="outline" className="ml-auto">
                Overall Score: {evaluationResult.overallScore?.toFixed(1) || 'N/A'}/10
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluationCriteria.map((criterion) => {
                const result = evaluationResult.criteria?.[criterion.key];
                const score = result?.score || 0;
                const feedback = result?.feedback || 'No feedback available';

                return (
                  <Card key={criterion.key} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          {criterion.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {getScoreIcon(score)}
                          <Badge className={`${getScoreColor(score)} border-0`}>
                            {score}/10
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600">{feedback}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Overall Summary */}
            <div className="bg-[#86DEE8]/20 border border-[#86DEE8]/50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Summary</h4>
              <p className="text-sm text-gray-700">
                Your idea scored <strong>{evaluationResult.overallScore?.toFixed(1) || 'N/A'}/10</strong> overall.
                {evaluationResult.overallScore >= 7 && " This is a strong idea with good potential!"}
                {evaluationResult.overallScore >= 5 && evaluationResult.overallScore < 7 && " This idea has potential but may need some refinement."}
                {evaluationResult.overallScore < 5 && " Consider revisiting and strengthening key aspects of this idea."}
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {evaluateMutation.isPending && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#86DEE8] mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Running AI evaluation...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
