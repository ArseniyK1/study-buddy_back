import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { GrpcMethod } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import {
  AuthResponse,
  AuthServiceController,
  FindAllUsersRequest,
  GetProfileRequest,
  RefreshTokenRequest,
  SignInRequest,
  SignUpRequest,
  UpdateUserRequest,
  User,
  UserListResponse,
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

  @GrpcMethod('AuthService', 'UpdateUserInfo')
  async updateUserInfo(
    data: UpdateUserRequest,
    metadata: Metadata,
  ): Promise<User> {
    const role = metadata.get('role')[0]?.toString() || '';
    return await this.authService.updateUserInfo(data, role);
  }
}
