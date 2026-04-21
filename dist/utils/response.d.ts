import { Response } from 'express';
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: any;
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
export declare const sendSuccess: <T>(res: Response, message: string, data?: T, statusCode?: number, pagination?: ApiResponse["pagination"]) => Response;
export declare const sendError: (res: Response, message: string, statusCode?: number, error?: any) => Response;
export declare const sendCreated: <T>(res: Response, message: string, data?: T) => Response;
export declare const sendUnauthorized: (res: Response, message?: string) => Response;
export declare const sendForbidden: (res: Response, message?: string) => Response;
export declare const sendNotFound: (res: Response, message?: string) => Response;
export declare const sendServerError: (res: Response, error?: any) => Response;
export declare const getPagination: (page: number, limit: number) => {
    limit: number;
    offset: number;
};
export declare const getPaginationMeta: (total: number, page: number, limit: number) => {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};
//# sourceMappingURL=response.d.ts.map