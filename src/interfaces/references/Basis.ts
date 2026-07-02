export interface Basis {
  id: number;
  code: string;
  description: string;
  valueAdd: boolean;
}

// export interface Basis {
//   id(updateEditBasis: (id: number, existingBasis: Basis) => Promise<any>, id: any, payload: Basis): import("redux-saga/effects").PutEffect<import("redux-saga").AnyAction> | import("redux-saga/effects").CallEffect;
//   basisCode: number;
// }
