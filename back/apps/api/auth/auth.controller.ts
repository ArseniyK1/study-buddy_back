import { Body, Controller, Post, Request, Get, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sing-in.dto';
import {
  AuthResponse,
  FindAllUsersRequest,
  UserListResponse,
  UpdateUserRequest,
} from 'shared/generated/auth';
import { Public } from './guard/public.decorator';
import { SignUpDto } from './dto/sing-up.dto';
import { Observable } from 'rxjs';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { Metadata } from '@grpc/grpc-js';
import { User } from 'shared/generated/auth';
import { IRequest } from '@shared/types/IRequest.interface';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-in')
  @ApiOperation({ summary: 'Sign in to the application' })
  @ApiBody({ type: SignInDto })
  signIn(@Body() dto: SignInDto): Observable<AuthResponse> {
    return this.authService.signIn(dto);
  }

  @Public()
  @Post('sign-up')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: SignUpDto })
  signUp(
    @Body() dto: SignUpDto,
    @Request() req?: any,
  ): Observable<AuthResponse> {
    return this.authService.signUp(dto, req?.user?.userId);
  }

  @Post('all-users')
  @ApiOperation({ summary: 'Get all users' })
  findAllUsers(@Body() dto: FindAllUsersRequest): Observable<UserListResponse> {
    return this.authService.findAllUsers(dto);
  }

  @Post('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req: any) {
    return this.authService.getProfile({ id: req.user.userId });
  }

  @Put('update-profile')
  @ApiOperation({ summary: 'Update user profile' })
  updateUserInfo(
    @Body() dto: { id: number; is_banned?: boolean; ban_reason?: string },
    @Request() req: IRequest,
  ): Observable<User> {
    const metadata = new Metadata();
    metadata.set('role', req.user.role);

    // Format the request for gRPC service
    const request: UpdateUserRequest = {
      id: dto.id,
      isBanned: dto.is_banned,
      banReason: dto.ban_reason,
      userInfo: undefined, // We don't need to update user info in this case
    };

    return this.authService.updateUserInfo(request, metadata);
  }

  @Get('my-workspace')
  @ApiOperation({ summary: 'Получение данных о своем коворкинге' })
  async getMyWorkspace(@Request() req: IRequest) {
    return this.authService.getMyWorkspace(req);
  }
}
