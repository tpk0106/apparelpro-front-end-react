export interface ToolbarPin {
  groupKey: string;
  itemRouterLink: string;
  sortOrder: number;
}

export interface ToolbarPreference {
  isEnabled: boolean;
  isDefault: boolean;
  pins: ToolbarPin[];
}

export interface SaveToolbarPreference {
  isEnabled: boolean;
  pins: ToolbarPin[];
}
