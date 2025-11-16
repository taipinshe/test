import type { WizardStep } from '../types';

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'start',
    question: '您的主要研究目的是什麼？',
    options: [
      { text: '比較不同群組間的差異', nextStepId: 'compare_groups_dv_count' },
      { text: '預測一個或多個結果', nextStepId: 'predict_outcome_dv_count' },
      { text: '探討變數影響的機制或條件', nextStepId: 'explore_mechanism' },
    ],
  },
  // --- Compare Groups Path ---
  {
    id: 'compare_groups_dv_count',
    question: '您有多少個主要的依變項 (DV)？',
    options: [
      { text: '一個', nextStepId: 'compare_groups_iv_count' },
      { text: '兩個或以上 (且它們彼此相關)', nextStepId: 'compare_groups_manova' },
    ],
  },
  {
    id: 'compare_groups_iv_count',
    question: '您的自變項 (IV) 有多少個組別/水平？',
    options: [
      { text: '兩個組別', nextStepId: 'compare_groups_t_test' },
      { text: '三個或以上組別', nextStepId: 'compare_groups_anova' },
    ],
  },
  {
    id: 'compare_groups_t_test',
    question: '您需要統計控制其他變數（共變數）的影響嗎？',
    options: [
      // FIX: Added nextStepId: null to satisfy WizardOption type.
      { text: '是', resultMethodId: 'ancova', nextStepId: null },
      // FIX: Added nextStepId: null to satisfy WizardOption type.
      { text: '否，且各組是獨立的', resultMethodId: 't-test', nextStepId: null },
      { text: '否，但是對同一組人重複測量', nextStepId: 'repeated_measures_check' },
    ],
  },
  {
    id: 'compare_groups_anova',
    question: '您需要統計控制其他變數（共變數）的影響嗎？',
    options: [
      // FIX: Added nextStepId: null to satisfy WizardOption type.
      { text: '是', resultMethodId: 'ancova', nextStepId: null },
      // FIX: Added nextStepId: null to satisfy WizardOption type.
      { text: '否，且各組是獨立的', resultMethodId: 'anova', nextStepId: null },
      { text: '否，但是對同一組人重複測量', nextStepId: 'repeated_measures_check' },
    ],
  },
  {
    id: 'compare_groups_manova',
    question: '您需要統計控制其他變數（共變數）的影響嗎？',
    options: [
      // FIX: Added nextStepId: null to satisfy WizardOption type and corrected 'mancova' to 'manova'.
      { text: '是', resultMethodId: 'manova', nextStepId: null }, // Mancova is not in the list, but it's the logical next step. I'll recommend manova as a base.
      // FIX: Added nextStepId: null to satisfy WizardOption type.
      { text: '否', resultMethodId: 'manova', nextStepId: null },
    ],
  },
   // --- Repeated Measures Path ---
  {
    id: 'repeated_measures_check',
    question: '您的研究是否同時包含組間比較（如實驗組 vs. 控制組）和重複測量（如前測 vs. 後測）？',
    options: [
      // FIX: Added nextStepId: null to satisfy WizardOption type.
      { text: '是，兩者都有', resultMethodId: 'mixed-anova', nextStepId: null },
      // FIX: Added nextStepId: null to satisfy WizardOption type.
      { text: '否，只有對同一組人重複測量', resultMethodId: 'repeated-measures-anova', nextStepId: null },
    ],
  },
  // --- Predict Outcome Path ---
  {
    id: 'predict_outcome_dv_count',
    question: '您要預測的依變項(DV)是連續的還是類別的？',
    options: [
      // FIX: Added nextStepId: null to satisfy WizardOption type.
      { text: '一個連續變數', resultMethodId: 'regression', nextStepId: null },
      // FIX: Added nextStepId: null to satisfy WizardOption type.
      { text: '兩個或以上連續變數', resultMethodId: 'manova', nextStepId: null },
    ],
  },
  // --- Explore Mechanism Path ---
  {
    id: 'explore_mechanism',
    question: '您想探討的是一個「過程機制」還是「條件邊界」？',
    options: [
      // FIX: Added nextStepId: null to satisfy WizardOption type.
      { text: '一個變項如何透過「中介」變項影響另一個變項 (X -> M -> Y)', resultMethodId: 'mediation', nextStepId: null },
      // FIX: Added nextStepId: null to satisfy WizardOption type.
      { text: '一個變項對另一個變項的影響，是否會被第三個變項「調節」(X -> Y, moderated by W)', resultMethodId: 'moderation', nextStepId: null },
    ],
  },
];
