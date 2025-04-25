import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { WorkplaceService } from './workplace.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PlaceResponseDto } from './dto/place-response.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Workplace')
@Controller('workplace')
export class WorkplaceController {
  constructor(private readonly workplaceService: WorkplaceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workplace' })
  @ApiBody({ type: CreatePlaceDto })
  @ApiResponse({
    status: 201,
    description: 'The workplace has been successfully created.',
    type: PlaceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Zone not found.' })
  create(
    @Body() createPlaceDto: CreatePlaceDto,
  ): Promise<PlaceResponseDto | any> {
    return this.workplaceService.create(createPlaceDto);
  }

  // Get all places
  @Get()
  @ApiOperation({ summary: 'Get all workplaces' })
  @ApiResponse({
    status: 200,
    description: 'Return all workplaces.',
    type: [PlaceResponseDto],
  })
  findAll(): Promise<PlaceResponseDto[] | any> {
    return this.workplaceService.findAll();
  }

  // Get a place by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get a workplace by ID' })
  @ApiParam({ name: 'id', description: 'Workplace ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the workplace.',
    type: PlaceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Workplace not found.' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PlaceResponseDto | any> {
    return this.workplaceService.findOne(id);
  }

  // Update a place
  @Patch(':id')
  @ApiOperation({ summary: 'Update a workplace' })
  @ApiParam({ name: 'id', description: 'Workplace ID' })
  @ApiBody({ type: UpdatePlaceDto })
  @ApiResponse({
    status: 200,
    description: 'The workplace has been successfully updated.',
    type: PlaceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Workplace or zone not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlaceDto: UpdatePlaceDto,
  ): Promise<PlaceResponseDto | any> {
    return this.workplaceService.update(id, updatePlaceDto);
  }

  // Remove a place
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a workplace' })
  @ApiParam({ name: 'id', description: 'Workplace ID' })
  @ApiResponse({
    status: 200,
    description: 'The workplace has been successfully deleted.',
    type: PlaceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Workplace not found.' })
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PlaceResponseDto | any> {
    return this.workplaceService.remove(id);
  }

  // Create a booking for a place
  @Post('booking')
  @ApiOperation({ summary: 'Create a booking for a workplace' })
  @ApiBody({ type: CreateBookingDto })
  @ApiResponse({
    status: 201,
    description: 'The booking has been successfully created.',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request or place already booked for the requested time period.',
  })
  @ApiResponse({ status: 404, description: 'Place or user not found.' })
  createBooking(
    @Body() createBookingDto: CreateBookingDto,
  ): Promise<BookingResponseDto | any> {
    return this.workplaceService.createBooking(createBookingDto);
  }

  // Get all bookings for a place
  @Get(':id/bookings')
  @ApiOperation({ summary: 'Get all bookings for a workplace' })
  @ApiParam({ name: 'id', description: 'Workplace ID' })
  @ApiResponse({
    status: 200,
    description: 'Return all bookings for the workplace.',
    type: [BookingResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Workplace not found.' })
  getPlaceBookings(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BookingResponseDto[] | any> {
    return this.workplaceService.getPlaceBookings(id);
  }
}
