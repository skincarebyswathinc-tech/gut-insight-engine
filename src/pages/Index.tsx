import { useState } from 'react';
import { QuestionnaireResponse, AssessmentSummary } from '@/types/assessment';
import { generateAssessment } from '@/utils/assessmentEngine';
import QuestionnaireForm from '@/components/QuestionnaireForm';
import AssessmentResults from '@/components/AssessmentResults';

const Index = () => {
  const [summary, setSummary] = useState<AssessmentSummary | null>(null);

  const handleSubmit = (data: QuestionnaireResponse) => {
    setSummary(generateAssessment(data));
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary">
          Gut Health Assessment
        </h1>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Complete the clinical questionnaire below to receive a structured digestive health summary.
        </p>
      </div>

      {summary ? (
        <AssessmentResults summary={summary} onReset={() => setSummary(null)} />
      ) : (
        <QuestionnaireForm onSubmit={handleSubmit} />
      )}
    </div>
  );
};

export default Index;
