import type { ServiceListRequest } from "../types.js";

const AIRPORT_PATTERN = /^[A-Z]{3}$/;
const COUNTRY_PATTERN = /^[A-Z]{2}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;
const RECORD_LOCATOR_PATTERN = /^[A-Z0-9]{6}$/;
const FLIGHT_NUMBER_PATTERN = /^\d{1,5}$/;

export type ValidationErrors = Record<string, string>;

function isPastOrToday(date: string): boolean {
  const today = new Date();
  const d = new Date(date + "T00:00:00Z");
  return d.getTime() < Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
}

export function validateRequest(req: ServiceListRequest): ValidationErrors {
  const e: ValidationErrors = {};
  const tc = req.transactionControl ?? ({} as ServiceListRequest["transactionControl"]);
  const s = req.saleInfo ?? ({} as ServiceListRequest["saleInfo"]);
  const f = req.flight ?? ({} as ServiceListRequest["flight"]);
  const p = req.pricingInfo ?? ({} as ServiceListRequest["pricingInfo"]);

  const has = (v: unknown): boolean => typeof v === "string" && v.trim().length > 0;

  if (!has(tc.app)) e["tc.app"] = "TransactionControl app is mandatory";
  if (!has(tc.idenUser)) e["tc.idenUser"] = "Identity user is mandatory";
  if (!has(tc.idenPassword)) e["tc.idenPassword"] = "Identity password is mandatory";
  if (!has(tc.providerEnv)) e["tc.providerEnv"] = "Provider env is mandatory";
  if (!has(tc.trace)) e["tc.trace"] = "Trace is mandatory";
  if (!has(tc.transactionIdentifier)) e["tc.transactionIdentifier"] = "Transaction identifier is mandatory";

  if (!has(req.recordLocator)) e["recordLocator"] = "Record locator is mandatory";
  else if (!RECORD_LOCATOR_PATTERN.test(req.recordLocator))
    e["recordLocator"] = "Record locator must be 6 uppercase alphanumeric characters";

  if (!has(s.cityCode)) e["sale.cityCode"] = "City code is mandatory";
  if (!has(s.countryCode)) e["sale.countryCode"] = "Country code is mandatory";
  else if (!COUNTRY_PATTERN.test(s.countryCode)) e["sale.countryCode"] = "Country code must be 2 letters";
  if (!has(s.channel)) e["sale.channel"] = "Channel is mandatory";
  if (!has(s.pointOfOrigin)) e["sale.pointOfOrigin"] = "Point of origin is mandatory";
  else if (!AIRPORT_PATTERN.test(s.pointOfOrigin)) e["sale.pointOfOrigin"] = "Point of origin must be a 3-letter airport code";

  if (!has(f.associationId)) e["flight.associationId"] = "Association ID is mandatory";
  if (!has(f.airlineCode)) e["flight.airlineCode"] = "Airline code is mandatory";
  if (!has(f.flightNumber)) e["flight.flightNumber"] = "Flight number is mandatory";
  else if (!FLIGHT_NUMBER_PATTERN.test(f.flightNumber)) e["flight.flightNumber"] = "Flight number must be numeric";

  if (!has(f.departureAirport)) e["flight.departureAirport"] = "Departure airport is mandatory";
  else if (!AIRPORT_PATTERN.test(f.departureAirport)) e["flight.departureAirport"] = "Departure airport must be 3 letters";
  if (!has(f.departureDate)) e["flight.departureDate"] = "Departure date is mandatory";
  else if (!DATE_PATTERN.test(f.departureDate)) e["flight.departureDate"] = "Departure date format invalid (YYYY-MM-DD)";
  else if (isPastOrToday(f.departureDate)) e["flight.departureDate"] = "Departure date must be in the future";
  if (!has(f.departureTime)) e["flight.departureTime"] = "Departure time is mandatory";
  else if (!TIME_PATTERN.test(f.departureTime)) e["flight.departureTime"] = "Departure time format invalid (HH:MM)";

  if (!has(f.arrivalAirport)) e["flight.arrivalAirport"] = "Arrival airport is mandatory";
  else if (!AIRPORT_PATTERN.test(f.arrivalAirport)) e["flight.arrivalAirport"] = "Arrival airport must be 3 letters";
  else if (f.departureAirport && f.arrivalAirport === f.departureAirport)
    e["flight.arrivalAirport"] = "Arrival airport cannot be the same as departure airport";
  if (!has(f.arrivalDate)) e["flight.arrivalDate"] = "Arrival date is mandatory";
  else if (!DATE_PATTERN.test(f.arrivalDate)) e["flight.arrivalDate"] = "Arrival date format invalid (YYYY-MM-DD)";
  if (!has(f.arrivalTime)) e["flight.arrivalTime"] = "Arrival time is mandatory";
  else if (!TIME_PATTERN.test(f.arrivalTime)) e["flight.arrivalTime"] = "Arrival time format invalid (HH:MM)";

  if (f.departureDate && f.arrivalDate && f.departureDate > f.arrivalDate)
    e["flight.arrivalDate"] = "Arrival date cannot be before departure date";

  if (!has(f.cabin)) e["flight.cabin"] = "Cabin is mandatory";
  if (!has(f.classOfService)) e["flight.classOfService"] = "Class of service is mandatory";
  if (!has(f.equipmentName)) e["flight.equipmentName"] = "Equipment is mandatory";

  if (p.showNotEligibleItems !== "Y" && p.showNotEligibleItems !== "N")
    e["pricing.showNotEligibleItems"] = "ShowNotEligibleItems must be Y or N";
  if (p.taxes !== "Y" && p.taxes !== "N") e["pricing.taxes"] = "Taxes must be Y or N";

  return e;
}
