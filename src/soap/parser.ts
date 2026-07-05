import { XMLParser } from "fast-xml-parser";
import type {
  OptionalService,
  ServiceListResponse,
  ServicePriceCalcOperation,
  TaxBreakdown,
  RuleCategory,
} from "../types.js";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  removeNSPrefix: true,
  tagValueProcessor: (_tag, val) => (typeof val === "string" ? val.trim() : val),
  isArray: () => false,
});

function asArray<T>(v: T | T[] | undefined): T[] {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v : [v];
}

function textOf(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v !== null && "#text" in v) {
    return String((v as Record<string, unknown>)["#text"] ?? "");
  }
  return String(v);
}

function attr(v: unknown, name: string): string {
  if (v && typeof v === "object" && name in (v as Record<string, unknown>)) {
    return String((v as Record<string, unknown>)[name] ?? "");
  }
  return "";
}

/**
 * Parses a Farelogix ServiceListRS SOAP envelope into structured JSON.
 */
export function parseServiceListRS(
  rawXml: string,
  requestXml: string,
): ServiceListResponse {
  const doc = parser.parse(rawXml) as Record<string, unknown>;
  const body = path(doc, ["Envelope", "Body", "FlxTransactionResponse", "ServiceListRS", "OptionalServices"]) as
    | Record<string, unknown>
    | undefined;

  const currencyCode = textOf(body?.["CurrencyCode"]);
  const currencyDecimals = attr(body?.["CurrencyCode"], "@_NumberOfDecimals");
  const serviceNodes = asArray(body?.["Service"]) as Record<string, unknown>[];

  const services: OptionalService[] = serviceNodes.map((svc) => {
    const servicePrice = svc["ServicePrice"] as Record<string, unknown> | undefined;
    const taxesNode = servicePrice?.["Taxes"] as Record<string, unknown> | undefined;
    const taxNodes = asArray(taxesNode?.["Tax"]) as Record<string, unknown>[];
    const filedIn = servicePrice?.["FiledIn"] as Record<string, unknown> | undefined;
    const calcNode = svc["ServicePriceCalc"] as Record<string, unknown> | undefined;
    const opNodes = asArray(calcNode?.["Operation"]) as Record<string, unknown>[];
    const booking = svc["BookingInstructions"] as Record<string, unknown> | undefined;
    const rulesNode = svc["Rules"] as Record<string, unknown> | undefined;
    const catNodes = asArray(rulesNode?.["Category"]) as Record<string, unknown>[];

    const taxes: TaxBreakdown[] = taxNodes.map((t) => ({
      amount: Number(textOf(t["Amount"]) || attr(t, "@_Amount") || 0),
      designator: textOf(t["Designator"]),
      nature: textOf(t["Nature"]),
      description: textOf(t["Description"]),
    }));

    const calc: ServicePriceCalcOperation[] = opNodes.map((op) => {
      const adj = op["Adjustment"] as Record<string, unknown> | undefined;
      const conv = op["Converted"] as Record<string, unknown> | undefined;
      return {
        seq: attr(op, "@_Seq"),
        env: attr(op, "@_Env"),
        type: attr(op, "@_Type"),
        adjustmentInput: attr(adj, "@_Input"),
        adjustmentResult: attr(adj, "@_Result"),
        adjustmentCurr: attr(adj, "@_Curr"),
        adjustmentValue: textOf(adj),
        convertedInput: attr(conv, "@_Input"),
        convertedResult: attr(conv, "@_Result"),
        convertedCurr: attr(conv, "@_Curr"),
        convertedValue: textOf(conv),
      };
    });

    const rules: RuleCategory[] = catNodes.map((c) => {
      const ruleText = c["RuleText"] as Record<string, unknown> | undefined;
      return {
        type: attr(c, "@_Type"),
        code: attr(c, "@_Code"),
        text: textOf(ruleText?.["Text"]),
        allowed: textOf(c["Allowed"]) || undefined,
      };
    });

    return {
      method: attr(svc, "@_Method"),
      reasonCode: attr(svc, "@_ReasonCode"),
      type: attr(svc, "@_Type"),
      serviceCode: attr(svc, "@_ServiceCode"),
      subCode: attr(svc, "@_SubCode"),
      travelerIdRef: textOf(svc["TravelerIDRef"]),
      segmentIdRef: textOf(svc["SegmentIDRef"]),
      description: textOf(svc["Description"]),
      amount: Number(textOf(svc["Amount"]) || 0),
      servicePriceTotal: Number(attr(servicePrice, "@_Total") || 0),
      basePrice: Number(attr(servicePrice?.["BasePrice"], "@_Amount") || 0),
      taxesTotal: Number(attr(taxesNode, "@_Amount") || 0),
      taxes,
      filedInCurrency: textOf(filedIn?.["CurrencyCode"]),
      filedInRate: attr(filedIn?.["CurrencyCode"], "@_Rate"),
      filedInAmount: textOf(filedIn?.["Amount"]),
      filedInDispAmount: textOf(filedIn?.["DispAmount"]),
      servicePriceCalc: calc,
      mktGridDiagnosticsId: textOf(svc["MktGridDiagnosticsID"]),
      bookingMethod: textOf(booking?.["Method"]),
      upgradeMethod: textOf(booking?.["UpgradeMethod"]),
      upgradeNewCabin: attr(booking?.["UpgradeMethod"], "@_NewCabin"),
      rules,
      diagnosticsId: attr(svc["Diagnostics"], "@_ID"),
    };
  });

  return {
    currencyCode,
    currencyDecimals,
    services,
    rawXml,
    requestXml,
  };
}

function path(obj: unknown, keys: string[]): unknown {
  let cur: unknown = obj;
  for (const k of keys) {
    if (cur && typeof cur === "object" && k in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }
  return cur;
}
