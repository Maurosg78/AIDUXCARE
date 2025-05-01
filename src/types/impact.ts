export interface ImpactData {
  id: string;
  title: string;
  description: string;
  metrics: {
    patientsHelped: number;
    timeSaved: number;
    costReduction: number;
  };
  timeline: {
    date: string;
    event: string;
  }[];
  testimonials: {
    id: string;
    name: string;
    role: string;
    content: string;
  }[];
  statistics: {
    category: string;
    value: number;
    unit: string;
  }[];
} 