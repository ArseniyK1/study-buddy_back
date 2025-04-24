import { IsString, IsOptional, IsInt } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreatePlaceDto } from './create-place.dto';

export class UpdatePlaceDto extends PartialType(CreatePlaceDto) {}
