import { Body, Controller, Post, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sing-in.dto';
import {
  AuthResponse,
  FindAllUsersRequest,
  UserListResponse,
} from 'shared/generated/auth';
import { Public } from './guard/public.decorator';
import { SignUpDto } from './dto/sing-up.dto';
import { Observable } from 'rxjs';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

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

  @Get('workspaces')
  @ApiOperation({ summary: 'Get user workspaces' })
  getUserWorkspaces(@Request() req: any) {
    return this.authService.getUserWorkspaces(req.user.userId);
  }
}
