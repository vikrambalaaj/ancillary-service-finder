import type { ServiceListRequest } from "../types.js";

export interface Option {
  value: string;
  label: string;
}

export const AIRPORTS: Option[] = [
  { value: "DXB", label: "DXB — Dubai" },
  { value: "BOM", label: "BOM — Mumbai" },
  { value: "DEL", label: "DEL — New Delhi" },
  { value: "LHR", label: "LHR — London Heathrow" },
  { value: "JFK", label: "JFK — New York" },
  { value: "SIN", label: "SIN — Singapore" },
  { value: "SYD", label: "SYD — Sydney" },
  { value: "MAA", label: "MAA — Chennai" },
  { value: "BLR", label: "BLR — Bengaluru" },
  { value: "HYD", label: "HYD — Hyderabad" },
  { value: "COK", label: "COK — Kochi" },
  { value: "DOH", label: "DOH — Doha" },
];

export const COUNTRIES: Option[] = [
  { value: "AE", label: "AE — United Arab Emirates" },
  { value: "IN", label: "IN — India" },
  { value: "GB", label: "GB — United Kingdom" },
  { value: "US", label: "US — United States" },
  { value: "SG", label: "SG — Singapore" },
  { value: "AU", label: "AU — Australia" },
  { value: "QA", label: "QA — Qatar" },
];

export const AIRLINES: Option[] = [
  { value: "EK", label: "EK — Emirates" },
  { value: "EY", label: "EY — Etihad" },
  { value: "QR", label: "QR — Qatar Airways" },
  { value: "SQ", label: "SQ — Singapore Airlines" },
  { value: "BA", label: "BA — British Airways" },
];

export const CHANNELS: Option[] = [
  { value: "RCC", label: "RCC — Reservations/Customer Care" },
  { value: "WEB", label: "WEB — Web" },
  { value: "APP", label: "APP — Mobile App" },
  { value: "GDS", label: "GDS — Travel Agent" },
];

export const CABINS: Option[] = [
  { value: "Y", label: "Y — Economy" },
  { value: "W", label: "W — Premium Economy" },
  { value: "C", label: "C — Business" },
  { value: "J", label: "J — Business (Premium)" },
  { value: "F", label: "F — First" },
];

export const CLASS_OF_SERVICE: Option[] = [
  { value: "Y", label: "Y" },
  { value: "B", label: "B" },
  { value: "M", label: "M" },
  { value: "W", label: "W" },
  { value: "C", label: "C" },
  { value: "J", label: "J" },
  { value: "F", label: "F" },
];

export const EQUIPMENT: Option[] = [
  { value: "AIRBUS A350-900", label: "Airbus A350-900" },
  { value: "AIRBUS A380-800", label: "Airbus A380-800" },
  { value: "AIRBUS A350-1000", label: "Airbus A350-1000" },
  { value: "BOEING 777-300ER", label: "Boeing 777-300ER" },
  { value: "BOEING 787-9", label: "Boeing 787-9" },
  { value: "BOEING 777-200LR", label: "Boeing 777-200LR" },
];

export const YES_NO: Option[] = [
  { value: "Y", label: "Y — Yes" },
  { value: "N", label: "N — No" },
];

/** Airport -> ISO country code, used to auto-link Country to the selected City. */
export const AIRPORT_COUNTRY: Record<string, string> = {
  DXB: "AE",
  BOM: "IN",
  DEL: "IN",
  LHR: "GB",
  JFK: "US",
  SIN: "SG",
  SYD: "AU",
  MAA: "IN",
  BLR: "IN",
  HYD: "IN",
  COK: "IN",
  DOH: "QA",
};

export const DEMO_REQUEST: ServiceListRequest = {
  transactionControl: {
    app: "FMS2_EK",
    idenUser: "FMS2_EK",
    idenPassword: "sellmore",
    providerEnv: "EK_AP_Cabin_Upgrade.dbxml,EK_AP_Taxes.dbxml,EK_CH_RCC.dbxml,ATP_TAX",
    trace: "sbernal",
    transactionIdentifier: "TXN-1779268114591",
  },
  recordLocator: "MTUBBF",
  saleInfo: {
    cityCode: "DXB",
    countryCode: "AE",
    channel: "RCC",
    pointOfOrigin: "BOM",
  },
  flight: {
    associationId: "S1",
    airlineCode: "EK",
    flightNumber: "503",
    flightNumberSuffix: "EK",
    departureAirport: "DXB",
    departureDate: "2026-12-15",
    departureTime: "19:30",
    arrivalAirport: "BOM",
    arrivalDate: "2026-12-15",
    arrivalTime: "21:00",
    cabin: "Y",
    classOfService: "Y",
    equipmentName: "AIRBUS A350-900",
  },
  pricingInfo: {
    showNotEligibleItems: "Y",
    taxes: "Y",
  },
};
