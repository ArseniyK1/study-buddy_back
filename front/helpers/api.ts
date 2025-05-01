import { type AxiosRequestConfig } from "axios";

interface PaginationParams {
  page: number;
  pageSize: number;
}

interface RequestParams {
  [key: string]: any;
}

export const withPagination = (
  params: RequestParams,
  pagination: PaginationParams
): AxiosRequestConfig["params"] => {
  return {
    ...params,
    offset: (pagination.page - 1) * pagination.pageSize,
    limit: pagination.pageSize,
  };
};
