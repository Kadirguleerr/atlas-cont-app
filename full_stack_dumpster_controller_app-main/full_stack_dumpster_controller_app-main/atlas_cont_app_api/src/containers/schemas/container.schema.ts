import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContainerDocument = Container & Document;

@Schema({ _id: false })
export class ContainerItem {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  height: number;

  @Prop({ required: true })
  depth: number;

  @Prop({ required: true })
  volume_cm3: number;

  @Prop({ required: true })
  weight_kg: number;

  @Prop({ required: true })
  confidence: number;

  @Prop({ required: true })
  detected_at: string;
}

@Schema({ _id: false })
export class ContainerDimensions {
  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  height: number;

  @Prop({ required: true })
  depth: number;

  @Prop({ required: true })
  max_volume_cm3: number;

  @Prop({ required: true })
  max_weight_kg: number;
}

@Schema({ _id: false })
export class AIAnalysis {
  @Prop({ required: true })
  calculated_fill_rate: number;

  @Prop({ required: true })
  current_weight_kg: number;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  estimated_full_time: string;

  @Prop({ required: true })
  packing_efficiency: number;

  @Prop({ required: true })
  last_ai_scan: string;
}

@Schema({ timestamps: true })
export class Container {
  @Prop({ required: true, unique: true })
  id: number;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  district: string;

  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lng: number;

  @Prop({ type: ContainerDimensions, required: true })
  dimensions: ContainerDimensions;

  @Prop({ type: [ContainerItem], default: [] })
  items: ContainerItem[];

  @Prop({ type: AIAnalysis, required: true })
  ai_analysis: AIAnalysis;
}

export const ContainerSchema = SchemaFactory.createForClass(Container);
