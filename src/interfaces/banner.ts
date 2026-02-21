export interface Banner {
  _id: string;
  image: string;
  title: string;
  status: boolean;
  range: number;
  type: string;
  mainCategory?: { name: string; _id: string };
  subCategory?: { name: string; _id: string };
  latitude?: number;
  longitude?: number;
}
