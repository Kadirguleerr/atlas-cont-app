export type ContainerStatus = 'EMPTY' | 'NORMAL' | 'WARNING' | 'CRITICAL';
export type ItemCategory = 'PLASTIC' | 'PAPER' | 'ORGANIC' | 'GLASS' | 'METAL' | 'OTHER';

export interface ContainerItem {
  id: string;
  name: string;
  category: ItemCategory;
  width: number;
  height: number;
  depth: number;
  volume_cm3: number;
  weight_kg: number;
  confidence: number;
  detected_at: string;
}

export interface ContainerDimensions {
  width: number;
  height: number;
  depth: number;
  max_volume_cm3: number;
  max_weight_kg: number;
}

export interface AIAnalysis {
  calculated_fill_rate: number;
  current_weight_kg: number;
  status: ContainerStatus;
  estimated_full_time: string;
  packing_efficiency: number;
  last_ai_scan: string;
}

export interface Container {
  id: number;
  code: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  dimensions: ContainerDimensions;
  items: ContainerItem[];
  ai_analysis: AIAnalysis;
}
