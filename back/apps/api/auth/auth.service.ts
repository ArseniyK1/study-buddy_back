import {
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
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
  UpdateUserRequest,
} from 'shared/generated/auth';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Metadata } from '@grpc/grpc-js';
import { from, Observable } from 'rxjs';
import { handleRequest } from '../common/grpc/grpc.handle';
import { SignUpDto } from './dto/sing-up.dto';
import { PrismaService } from '@prisma/prisma.service';
import { IRequest } from '@shared/types/IRequest.interface';
import { WorkspaceService } from '../workspace/workspace.service';

@Injectable()
export class AuthService implements OnModuleInit, AuthServiceClient {
  constructor(
    @Inject('GRPC_SERVICE') private client: ClientGrpc,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prisma: PrismaService,
    private workspaceService: WorkspaceService,
  ) {}
  private authService: AuthServiceClient;

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceClient>('AuthService');
  }

  signIn(
    request: SignInRequest,
    metadata: Metadata = new Metadata(),
  ): Observable<AuthResponse> {
    return from(
      handleRequest(() => this.authService.signIn(request, metadata)),
    );
  }

  signUp(
    request: SignUpRequest,
    metadata: Metadata = new Metadata(),
  ): Observable<AuthResponse> {
    return from(
      handleRequest(() => this.authService.signUp(request, metadata)),
    );
  }

  findAllUsers(
    request: FindAllUsersRequest,
    metadata: Metadata = new Metadata(),
  ): Observable<UserListResponse> {
    return from(
      handleRequest(() => this.authService.findAllUsers(request, metadata)),
    );
  }

  getProfile(
    request: GetProfileRequest,
    metadata: Metadata = new Metadata(),
  ): Observable<User> {
    console.log('request', request);
    return from(
      handleRequest(() => this.authService.getProfile(request, metadata)),
    );
  }

  refreshToken(
    request: { refreshToken: string },
    metadata: Metadata = new Metadata(),
  ): Observable<AuthResponse> {
    console.log('request', JSON.stringify(request));
    return from(
      handleRequest(() => this.authService.refreshToken(request, metadata)),
    );
  }

  updateUserInfo(
    request: UpdateUserRequest,
    metadata: Metadata = new Metadata(),
  ): Observable<User> {
    return from(
      handleRequest(() => this.authService.updateUserInfo(request, metadata)),
    );
  }

  async getMyWorkspace(req: IRequest) {
    const workspaceManagerInfo = await this.prisma.workspaceManager.findFirst({
      where: {
        managerId: req.user.userId,
      },
    });

    if (!workspaceManagerInfo?.workspaceId) {
      return { success: false, data: {} };
    }

    const workspace = await this.workspaceService.findOne(
      workspaceManagerInfo.workspaceId,
    );

    if (workspace) {
      return workspace;
    }
  }
}
