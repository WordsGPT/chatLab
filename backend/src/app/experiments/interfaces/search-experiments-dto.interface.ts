// Interface that represents the response to the experiment search
export interface SearchExperimentsDto {
  id: string;
  name: string;
  description?: string;
  featured: boolean;
  lastViewed: Date;
}