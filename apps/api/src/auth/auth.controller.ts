import { Body, Controller, Post, Request } from '@nestjs/common';
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
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-in')
  signIn(@Body() dto: SignInDto): Observable<AuthResponse> {
    return this.authService.signIn(dto);
  }

  @Public()
  @Post('sign-up')
  signUp(@Body() dto: SignUpDto): Observable<AuthResponse> {
    return this.authService.signUp(dto);
  }

  @Post('all-users')
  findAllUsers(@Body() dto: FindAllUsersRequest): Observable<UserListResponse> {
    return this.authService.findAllUsers(dto);
  }

  @Post('profile')
  getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.userId);
  }
}
