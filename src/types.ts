export type Hanging = 'LH' | 'RH' | 'Slider' | 'Bi-Fold';
export type DoorCore = 'Poly' | 'Solid' | 'Honeycomb';
export type DoorFinish = 'Primed' | 'White' | 'RAW' | 'Custom';
export type JambMaterial = 'MDF' | 'Pine';
export type JambStyle = 'Flat' | 'Groove';
export type FrameType = 'Standard' | 'Cavity' | 'Bifold' | 'Custom';

export interface GlobalSpecs {
  hingeDetails: string;
  robeTrackColour: string;
  jambStyle: JambStyle;
  jambMaterial: JambMaterial;
  drillingRequired: boolean;
  hardwareBrand: string;
  handleHeight: string;
}

export interface DoorOrderRow {
  id: string;
  location: string;
  hanging: Hanging;
  height: string;
  width: string;
  thickness: string;
  trimHeight: string;
  trimWidth: string;
  floorGap: string;
  gibFrameSize: string;
  softClose: boolean;
  doorFinish: DoorFinish;
  doorCore: DoorCore;
  frameType: FrameType;
  hardwareCode: string;
  notes: string;
}

export interface OrderData {
  jobName: string;
  contactName: string;
  siteAddress: string;
  orderNumber: string;
  merchant: string;
  requiredBy: string;
  deliveryType: 'Delivery' | 'Collection';
  globalSpecs: GlobalSpecs;
  doors: DoorOrderRow[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  defaultMerchant?: string;
  defaultLocation?: string;
}

export interface OrderRecord {
  id: string;
  userId: string;
  data: OrderData;
  createdAt: string;
}
