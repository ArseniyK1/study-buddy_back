import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateBookingDto {
  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsEnum(['ACTIVE', 'CANCELLED', 'PENDING'])
  @IsOptional()
  status?: string;
}
