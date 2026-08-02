export type SystemParameterDataType =
  | "Boolean"
  | "Color"
  | "Number"
  | "Text"
  | "Select";

export interface SystemParameter {
  parameterKey: string;
  value: string;
  description: string | null;
  category: string;
  dataType: SystemParameterDataType;
  options: string | null;
}
