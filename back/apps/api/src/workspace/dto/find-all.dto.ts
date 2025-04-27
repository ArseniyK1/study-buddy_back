import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FindAllDto {
  @IsString()
  @IsOptional()
  query?: string;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  offset: number;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  limit: number;
}
