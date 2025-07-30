// Base service interface for all data services
export interface ServiceResponse<T> {
  data?: T;
  error?: string;
  loading?: boolean;
}

export interface PaginationParams {
  limit?: number;
  startAfter?: any;
}

export abstract class BaseService {
  protected async handleError<T>(
    operation: () => Promise<T>
  ): Promise<ServiceResponse<T>> {
    try {
      const data = await operation();
      return { data };
    } catch (error) {
      console.error(`Service error:`, error);
      return { 
        error: error instanceof Error ? error.message : 'An error occurred' 
      };
    }
  }
}