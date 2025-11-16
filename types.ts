
export interface StatisticalMethod {
  id: string;
  name: string;
  description: string;
  useWhen: string[];
  keywords: string[];
  explanation: string;
}

export interface WizardOption {
  text: string;
  nextStepId: string | null;
  resultMethodId?: string;
}

export interface WizardStep {
  id: string;
  question: string;
  options: WizardOption[];
}

export type Answers = Record<string, string>;

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
