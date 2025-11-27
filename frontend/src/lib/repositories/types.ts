import type { PipelineStage } from "mongoose";

export type LeanOption = {
  lean?: boolean;
};

export type PaginationOptions = {
  page?: number;
  limit?: number;
};

export type SortOption = Record<string, 1 | -1>;

export type QueryOptions = LeanOption &
  PaginationOptions & {
    sort?: SortOption;
    projection?: Record<string, 0 | 1>;
  };

export type AggregateOptions = {
  pipeline: PipelineStage[];
  allowDiskUse?: boolean;
};

