import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  AuthResponse,
  UserListResponse,
  FindAllUsersRequest,
  AuthServiceClient,
  SignInRequest,
  SignUpRequest,
  GetProfileRequest,
  User,
} from 'shared/generated/auth';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Metadata } from '@grpc/grpc-js';
import { Observable } from 'rxjs';

@Injectable()
export class AuthService implements OnModuleInit, AuthServiceClient {
  constructor(
    @Inject('GRPC_SERVICE') private client: ClientGrpc,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  private authService: AuthServiceClient;

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceClient>('AuthService');
  }

  signIn(
    request: SignInRequest,
    metadata: Metadata = new Metadata(),
  ): Observable<AuthResponse> {
    return this.authService.signIn(request, metadata);
  }

  signUp(
    request: SignUpRequest,
    metadata: Metadata = new Metadata(),
  ): Observable<AuthResponse> {
    return this.authService.signUp(request, metadata);
  }

  findAllUsers(
    request: FindAllUsersRequest,
    metadata: Metadata = new Metadata(),
  ): Observable<UserListResponse> {
    return this.authService.findAllUsers(request, metadata);
  }

  getProfile(
    request: GetProfileRequest,
    metadata: Metadata = new Metadata(),
  ): Observable<User> {
    return this.authService.getProfile(request, metadata);
  }

  refreshToken(
    request: { refreshToken: string },
    metadata: Metadata = new Metadata(),
  ): Observable<AuthResponse> {
    return this.authService.refreshToken(request, metadata);
  }
}
