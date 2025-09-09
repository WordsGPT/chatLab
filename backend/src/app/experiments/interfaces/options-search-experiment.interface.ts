import { OrderDirection } from '@core/enums/order-direction.enum';

// Interface for searching and filtering experiment executions
export interface OptionsSearchExperimentDto {
  page?: number;
  featured?: boolean;
  lastViewed?: OrderDirection;
  createdAt?: OrderDirection;
}
