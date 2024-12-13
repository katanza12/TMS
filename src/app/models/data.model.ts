export type DataModel = {
  id: number,
  description: string,
  icon: string,
  color?: string,
  sort: number,
}

export enum DataEnum {
  Status,
  Category
}
