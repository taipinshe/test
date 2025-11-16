
import type { StatisticalMethod } from '../types';

export const STATISTICAL_METHODS: StatisticalMethod[] = [
  {
    id: 't-test',
    name: '獨立樣本 t 檢定 (Independent Samples t-test)',
    description: '專門用來比較兩個獨立組別在一個連續依變項上平均數差異的標準統計方法。',
    useWhen: [
      '自變項為一個具有兩個水平的類別變數。',
      '依變項為一個連續變數。',
      '兩組受試者是獨立的。',
    ],
    keywords: ['t檢定', 't-test', '兩組', 'two groups', '比較平均數'],
    explanation:
      '當研究設計僅涉及比較兩個獨立群組（例如：遊戲化教學組 vs. 傳統講述組）在單一連續結果（例如：學習動機總分）上的差異時，獨立樣本 t 檢定是最適當的分析方法。執行前需注意檢驗樣本獨立性、常態性與變異數同質性的假設。',
  },
  {
    id: 'anova',
    name: '單因子變異數分析 (One-Way ANOVA)',
    description: '比較三個或以上獨立組別在一個連續依變項上平均數差異的方法。',
    useWhen: [
      '自變項為一個具有三個或以上水平的類別變數。',
      '依變項為一個連續變數。',
      '各組受試者是獨立的。',
    ],
    keywords: ['anova', '變異數分析', '多組', 'three or more groups'],
    explanation:
      '若研究想比較三種或以上的教學法（例如：遊戲化、PBL、傳統）的效果，則應使用ANOVA。它能透過一次性的整體檢定，控制第一類型錯誤的膨脹率。若F檢定達顯著，需進行事後比較(Post-hoc tests)來確定具體是哪些組別之間存在差異。',
  },
  {
    id: 'ancova',
    name: '共變數分析 (ANCOVA)',
    description: '在比較組間差異時，統計上控制一個或多個連續干擾變數（共變數）的影響。',
    useWhen: [
      '比較兩個或以上組別的平均數。',
      '存在一個或多個可能影響依變項的連續干擾變數（共變數）。',
      '常用於準實驗設計，用以校正組別間的初始差異。',
    ],
    keywords: ['ancova', '共變數分析', '控制變數', 'covariate'],
    explanation:
      '在準實驗設計中，當無法隨機分派而擔心組別間存在初始差異時（如先前學習興趣不同），ANCOVA能統計上排除這些差異的影響，讓我們得到更「純粹」的教學效果估計。其最關鍵的前提假設是「迴歸斜率同質性」。',
  },
  {
    id: 'repeated-measures-anova',
    name: '重複量數變異數分析 (Repeated Measures ANOVA)',
    description: '分析同一個群體在三個或以上不同時間點或不同條件下的變化。',
    useWhen: [
      '受試者內設計 (within-subjects design)。',
      '依變項在三個或以上時間點被重複測量。',
    ],
    keywords: ['重複量數', '縱貫性研究', 'repeated measures', 'longitudinal'],
    explanation:
      '當研究想探討單一組別（例如遊戲化教學組）的學習動機是否隨時間（學期初、期中、期末）產生顯著變化時，重複量數ANOVA是最佳選擇。它能有效排除個體間的穩定差異，更精準地檢驗由時間造成的變化。需特別注意「球形假設」的檢定。',
  },
  {
    id: 'mixed-anova',
    name: '混合設計變異數分析 (Mixed ANOVA)',
    description: '同時處理受試者間因子（如不同組別）與受試者內因子（如不同時間點）的影響。',
    useWhen: [
      '研究設計包含至少一個受試者間因子和一個受試者內因子。',
      '主要想探討兩者的交互作用，即不同組別的變化軌跡是否不同。',
    ],
    keywords: ['混合設計', 'mixed anova', '變化軌跡'],
    explanation:
      '當我們想比較「不同教學法」對學習動機的「長期變化軌跡」是否不同時，混合設計ANOVA是首選。它能回答比單純ANOVA或重複量數ANOVA更複雜的問題，其核心在於檢視「時間 × 組別」的交互作用。',
  },
  {
    id: 'manova',
    name: '多變量變異數分析 (MANOVA)',
    description: '同時比較各組在兩個或以上互相關聯的連續依變項上的差異。',
    useWhen: [
      '自變項為類別變數。',
      '依變項為兩個或以上的連續變數，且理論上相關。',
      '想控制因進行多次ANOVA而導致的第一類型錯誤膨脹。',
    ],
    keywords: ['manova', '多變量', 'multiple dvs'],
    explanation:
      '當依變項是多面向的（例如學習動機包含「內在動機」、「外在動機」、「自我效能」三個構面）時，應使用MANOVA來進行整體檢定，而非三次獨立的ANOVA。這能控制整體錯誤率並考量依變項間的關聯性，提高檢定力。',
  },
  {
    id: 'regression',
    name: '多元迴歸分析 (Multiple Regression)',
    description: '使用多個自變項（預測變項）來預測一個連續依變項（結果變項）。',
    useWhen: [
      '研究目標是「預測」而非「比較差異」。',
      '依變項為一個連續變數。',
      '自變項可以是連續或類別（需虛擬編碼）。',
    ],
    keywords: ['迴歸', 'regression', '預測', 'prediction'],
    explanation:
      '當研究問題是「哪些因素能有效預測學生的學習動機？」時，多元迴歸是合適的工具。它能告訴我們每個預測變項的獨立貢獻度。分析前需注意檢查變數間是否存在多元共線性問題(VIF)。',
  },
  {
    id: 'mediation',
    name: '中介分析 (Mediation Analysis)',
    description: '探討自變項(X)如何「透過」一個中介變項(M)來影響依變項(Y)的機制。',
    useWhen: [
      '研究問題涉及「如何」或「為什麼」X會影響Y。',
      '理論上存在一個 X → M → Y 的因果鏈。',
    ],
    keywords: ['中介', 'mediation', 'process', '機制', 'mechanism'],
    explanation:
      '中介分析用於回答影響機制的問題，例如：「遊戲化教學法是如何提升學習動機的？是否是透過提升學生的『學習自我效能』來達成的？」當代標準檢測方法是使用拔靴法 (Bootstrapping) 來檢驗間接效果的顯著性。',
  },
  {
    id: 'moderation',
    name: '調節分析 (Moderation Analysis)',
    description: '探討自變項(X)對依變項(Y)的影響，是否會受到另一個調節變項(W)的影響而改變。',
    useWhen: [
      '研究問題涉及「在什麼條件下」或「對什麼人」X對Y的影響會更強或更弱。',
      '探討效果的邊界條件。',
    ],
    keywords: ['調節', 'moderation', '交互作用', 'interaction'],
    explanation:
      '調節分析用於回答效果的條件性問題，例如：「遊戲化教學法的效果，是否會因為學生的『自主性』高低而有所不同？」其核心是檢驗自變項與調節變項的「交互作用項」是否顯著。',
  },
];
