export interface IRequest {
  user: {
    userId: number;
    email: string;
    role: string;
  };
  headers: { authorization: string };
}
