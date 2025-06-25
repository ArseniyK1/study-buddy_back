import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  Request,
  Param,
  ParseIntPipe,
  ParseArrayPipe,
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
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { IRequest } from '@shared/types/IRequest.interface';
import { WorkplaceByIdDto } from './dto/workplace-by-id.dto';
import { GetPlaceBookingsDto } from './dto/get-place-bookings.dto';

@ApiTags('Рабочее место (Workplace)')
@Controller('workplace')
export class WorkplaceController {
  constructor(private readonly workplaceService: WorkplaceService) {}

  @Post()
  @ApiOperation({ summary: 'Добавить рабочее место в зону' })
  @ApiBody({ type: CreatePlaceDto })
  create(
    @Body() createPlaceDto: CreatePlaceDto,
  ): Promise<PlaceResponseDto | any> {
    return this.workplaceService.create(createPlaceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все рабочие места' })
  @ApiQuery({ name: 'zoneId', type: Number, required: false })
  findAll(@Query('zoneId') zoneId: number): Promise<PlaceResponseDto[] | any> {
    return this.workplaceService.findAll(+zoneId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить рабочее место по ID' })
  @ApiParam({ name: 'id', description: 'ID рабочего места' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query() dto: WorkplaceByIdDto,
  ): Promise<PlaceResponseDto | any> {
    return this.workplaceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить рабочее место' })
  @ApiParam({ name: 'id', description: 'ID рабочего места' })
  @ApiBody({ type: UpdatePlaceDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlaceDto: UpdatePlaceDto,
  ): Promise<PlaceResponseDto | any> {
    return this.workplaceService.update(id, updatePlaceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить рабочее место' })
  @ApiParam({ name: 'id', description: 'ID рабочего места' })
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PlaceResponseDto | any> {
    return this.workplaceService.remove(id);
  }

  @Post('booking')
  @ApiOperation({ summary: 'Создать бронирование для рабочего места' })
  @ApiBody({ type: CreateBookingDto })
  createBooking(
    @Request() req: IRequest,
    @Body() createBookingDto: CreateBookingDto,
  ): Promise<BookingResponseDto | any> {
    return this.workplaceService.createBooking(
      req.user.userId,
      createBookingDto,
    );
  }

  @Get(':id/bookings')
  @ApiOperation({
    summary: 'Получить все бронирования для рабочего места за дату',
  })
  @ApiParam({ name: 'id', description: 'ID рабочего места' })
  @ApiQuery({ name: 'date', description: 'Дата (YYYY-MM-DD)', required: false })
  @ApiQuery({
    name: 'placeIds',
    description: 'Список ID рабочих мест',
    required: false,
  })
  async getPlaceBookings_old(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: GetPlaceBookingsDto,
  ): Promise<BookingResponseDto[] | any> {
    return this.workplaceService.getPlaceBookings_old(
      id,
      query.date,
      query.placeIds,
    );
  }

  // workplace.controller.ts
  @Post('bookings')
  @ApiOperation({
    summary: 'Получить все бронирования для рабочих мест за дату',
  })
  @ApiBody({ type: GetPlaceBookingsDto })
  async getPlaceBookings(
    @Body() dto: GetPlaceBookingsDto,
  ): Promise<BookingResponseDto[] | any> {
    return this.workplaceService.getPlaceBookings(dto.placeIds, dto.date);
  }
}
