import { IsString, IsNumber, IsBoolean, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ContainerItemDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsNumber()
  depth: number;

  @IsNumber()
  volume_cm3: number;

  @IsNumber()
  weight_kg: number;

  @IsNumber()
  confidence: number;

  @IsString()
  detected_at: string;
}

export class ContainerDimensionsDto {
  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsNumber()
  depth: number;

  @IsNumber()
  max_volume_cm3: number;

  @IsNumber()
  max_weight_kg: number;
}

export class AIAnalysisDto {
  @IsNumber()
  calculated_fill_rate: number;

  @IsNumber()
  current_weight_kg: number;

  @IsString()
  status: string;

  @IsString()
  estimated_full_time: string;

  @IsNumber()
  packing_efficiency: number;

  @IsString()
  last_ai_scan: string;
}

export class CreateContainerDto {
  @IsNumber()
  id: number;

  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsString()
  district: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @ValidateNested()
  @Type(() => ContainerDimensionsDto)
  dimensions: ContainerDimensionsDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContainerItemDto)
  @IsOptional()
  items?: ContainerItemDto[];

  @ValidateNested()
  @Type(() => AIAnalysisDto)
  ai_analysis: AIAnalysisDto;
}
