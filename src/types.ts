export interface TransactionControl {
  app: string;
  idenUser: string;
  idenPassword: string;
  providerEnv: string;
  trace: string;
  transactionIdentifier: string;
}

export interface SaleInfo {
  cityCode: string;
  countryCode: string;
  channel: string;
  pointOfOrigin: string;
}

export interface FlightSegment {
  associationId: string;
  airlineCode: string;
  flightNumber: string;
  flightNumberSuffix: string;
  departureAirport: string;
  departureDate: string;
  departureTime: string;
  arrivalAirport: string;
  arrivalDate: string;
  arrivalTime: string;
  cabin: string;
  classOfService: string;
  equipmentName: string;
}

export interface PricingInfo {
  showNotEligibleItems: "Y" | "N";
  taxes: "Y" | "N";
}

export interface ServiceListRequest {
  transactionControl: TransactionControl;
  recordLocator: string;
  saleInfo: SaleInfo;
  flight: FlightSegment;
  pricingInfo: PricingInfo;
}

export interface TaxBreakdown {
  amount: number;
  designator: string;
  nature: string;
  description: string;
}

export interface ServicePriceCalcOperation {
  seq: string;
  env: string;
  type: string;
  adjustmentInput: string;
  adjustmentResult: string;
  adjustmentCurr: string;
  adjustmentValue: string;
  convertedInput: string;
  convertedResult: string;
  convertedCurr: string;
  convertedValue: string;
}

export interface RuleCategory {
  type: string;
  code: string;
  text: string;
  allowed?: string;
}

export interface OptionalService {
  method: string;
  reasonCode: string;
  type: string;
  serviceCode: string;
  subCode: string;
  travelerIdRef: string;
  segmentIdRef: string;
  description: string;
  amount: number;
  servicePriceTotal: number;
  basePrice: number;
  taxesTotal: number;
  taxes: TaxBreakdown[];
  filedInCurrency: string;
  filedInRate: string;
  filedInAmount: string;
  filedInDispAmount: string;
  servicePriceCalc: ServicePriceCalcOperation[];
  mktGridDiagnosticsId: string;
  bookingMethod: string;
  upgradeMethod: string;
  upgradeNewCabin: string;
  rules: RuleCategory[];
  diagnosticsId: string;
}

export interface ServiceListResponse {
  currencyCode: string;
  currencyDecimals: string;
  services: OptionalService[];
  rawXml: string;
  requestXml: string;
  /** Present when the backend returned no services (fault or empty OptionalServices). */
  message?: string;
  /** True when the response was a SOAP fault rather than a normal (empty) result. */
  fault?: boolean;
  /** True when services were substituted from the sample because the live call returned none. */
  fallback?: boolean;
}

export interface ApiError {
  errors: Record<string, string>;
  message: string;
}
