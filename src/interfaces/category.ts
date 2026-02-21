// src/interfaces/category.ts
export interface IFilterOption {
  _id?: string;
  name: string;
}

export interface IFilter {
  _id?: string;
  Filter_name: string;
  selected?: IFilterOption[];
}

export interface ISubCategory {
  _id?: string;
  name: string;
  description?: string;
  image?: string;
  attribute?: string[];
  status?: boolean;
  commison?: number;
}

export interface ICategory {
  _id?: string;
  name: string;
  description?: string;
  image?: string;
  subcat?: ISubCategory[];
  attribute?: string[];
  filter?: IFilter[];
  status?: boolean;
}
