import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { GrpcMethod } from '@nestjs/microservices';
import {
  AuthResponse,
  AuthServiceController,
  FindAllUsersRequest,
  GetProfileRequest,
  RefreshTokenRequest,
  SignInRequest,
  SignUpRequest,
  User,
  UserListResponse,
  SignInWithTelegramRequest,
  LinkTelegramAccountRequest,
} from 'shared/generated/auth';

@ApiTags('auth')
@Controller('auth')
export class AuthController implements AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'SignIn')
  async signIn(data: SignInRequest): Promise<AuthResponse> {
    return await this.authService.signIn(data);
  }

  @GrpcMethod('AuthService', 'SignUp')
  async signUp(data: SignUpRequest): Promise<AuthResponse> {
    return await this.authService.signUp(data);
  }

  @GrpcMethod('AuthService', 'FindAllUsers')
  async findAllUsers(data: FindAllUsersRequest): Promise<UserListResponse> {
    return await this.authService.findAllUsers(data);
  }

  @GrpcMethod('AuthService', 'GetProfile')
  async getProfile(data: GetProfileRequest): Promise<User> {
    return await this.authService.getProfile(data);
  }

  @GrpcMethod('AuthService', 'RefreshToken')
  async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    return await this.authService.refreshToken(data.refreshToken);
  }

  @GrpcMethod('AuthService', 'SignInWithTelegram')
  async signInWithTelegram(
    data: SignInWithTelegramRequest,
  ): Promise<AuthResponse> {
    return await this.authService.signInWithTelegram(data);
  }

  @GrpcMethod('AuthService', 'LinkTelegramAccount')
  async linkTelegramAccount(
    data: LinkTelegramAccountRequest,
  ): Promise<AuthResponse> {
    return await this.authService.linkTelegramAccount(data);
  }
}
