import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: number;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User first name' })
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  lastName: string;
}

export class BookingResponseDto {
  @ApiProperty({ description: 'Booking ID' })
  id: number;

  @ApiProperty({ description: 'Booking start time' })
  startTime: Date;

  @ApiProperty({ description: 'Booking end time' })
  endTime: Date;

  @ApiProperty({ description: 'Booking status' })
  status: string;

  @ApiProperty({ description: 'Total price of the booking' })
  totalPrice: number;

  @ApiProperty({ description: 'User ID who made the booking' })
  userId: number;

  @ApiProperty({ description: 'Place ID that was booked' })
  placeId: number;

  @ApiProperty({ description: 'User information' })
  user: UserResponseDto;
}
