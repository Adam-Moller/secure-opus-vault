import type { Opportunity } from "./opportunity";
import type { Store } from "./store";

export type CRMType = "sales" | "workforce";

export interface SalesCRMData {
  crmType: "sales";
  data: Opportunity[];
}

export interface WorkforceCRMData {
  crmType: "workforce";
  data: Store[];
}

export type CRMData = SalesCRMData | WorkforceCRMData;

export interface EncryptedCRMFile {
  fileName: string;
  createdDate: string;
  lastModified: string;
  crmType: CRMType;
  data: Opportunity[] | Store[];
}
