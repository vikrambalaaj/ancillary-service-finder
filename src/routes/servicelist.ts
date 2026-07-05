import { Router } from "express";
import type { Request, Response } from "express";
import type { ServiceListRequest, ServiceListResponse } from "../types.js";
import { validateRequest } from "./validate.js";
import { buildServiceListRQ } from "../soap/builder.js";
import { parseServiceListRS } from "../soap/parser.js";
import { SAMPLE_RESPONSE_XML } from "../data/sampleResponse.js";

export const serviceListRouter = Router();

const FARELOGIX_URL =
  process.env.FARELOGIX_URL || "https://ekd.farelogix.com/sandbox-uat/flxm";
const USE_SAMPLE_RESPONSE = process.env.USE_SAMPLE_RESPONSE === "true";
const ALWAYS_SHOW_SERVICES = process.env.ALWAYS_SHOW_SERVICES !== "false";
const REQUEST_TIMEOUT_MS = Number(process.env.FARELOGIX_TIMEOUT_MS || 20000);

/**
 * GET /api/options -> returns all dropdown options + demo payload.
 */
serviceListRouter.get("/options", async (_req: Request, res: Response) => {
  const options = await import("../data/options.js");
  res.json({
    options: {
      airports: options.AIRPORTS,
      countries: options.COUNTRIES,
      airlines: options.AIRLINES,
      channels: options.CHANNELS,
      cabins: options.CABINS,
      classOfService: options.CLASS_OF_SERVICE,
      equipment: options.EQUIPMENT,
      yesNo: options.YES_NO,
    },
    demo: options.DEMO_REQUEST,
    endpoint: FARELOGIX_URL,
    usingSample: USE_SAMPLE_RESPONSE,
    airportCountry: options.AIRPORT_COUNTRY,
  });
});

/**
 * Calls the live Farelogix endpoint with the built SOAP envelope.
 * Content-Type and credentials are carried inside the SOAP body
 * (ns6:iden u/p), exactly as in the attached valid request.
 *
 * Returns the raw response text for ANY HTTP status (including 500,
 * which Farelogix uses for business-level "No services found" faults),
 * so the caller can parse it and surface a friendly empty result.
 * Only network/timeout/parse failures throw.
 */
async function callFarelogix(requestXml: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const resp = await fetch(FARELOGIX_URL, {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: requestXml,
      signal: controller.signal,
    });
    const text = await resp.text();
    if (!text || !text.includes("<")) {
      throw new Error(`Farelogix returned a non-XML response (HTTP ${resp.status})`);
    }
    return text;
  } finally {
    clearTimeout(timer);
  }
}

function extractFaultString(xml: string): string | undefined {
  const m = xml.match(/<faultstring>([\s\S]*?)<\/faultstring>/);
  return m ? m[1].trim() : undefined;
}

/**
 * POST /api/servicelist
 * Body: ServiceListRequest
 * Returns: ServiceListResponse (built request XML + parsed live response).
 */
serviceListRouter.post("/servicelist", async (req: Request, res: Response) => {
  try {
    const body = req.body as ServiceListRequest;
    if (!body || typeof body !== "object") {
      res.status(400).json({ message: "Invalid request body" });
      return;
    }
    const errors = validateRequest(body);
    if (Object.keys(errors).length > 0) {
      res.status(400).json({ message: "Validation failed", errors });
      return;
    }

    const requestXml = buildServiceListRQ(body);

    let rawXml: string;
    try {
      rawXml = USE_SAMPLE_RESPONSE
        ? SAMPLE_RESPONSE_XML
        : await callFarelogix(requestXml);
    } catch (err) {
      const msg = (err as Error).message;
      const aborted = msg.includes("aborted");
      res.status(502).json({
        message: `Could not reach Farelogix endpoint${aborted ? " (timeout)" : ""}: ${msg}`,
        endpoint: FARELOGIX_URL,
      });
      return;
    }

    let parsed: ServiceListResponse;
    try {
      parsed = parseServiceListRS(rawXml, requestXml);
    } catch (err) {
      // Parsing failed but we still have the raw XML — return it so the user
      // can inspect the Response XML tab instead of getting a blank screen.
      res.json({
        currencyCode: "",
        currencyDecimals: "",
        services: [],
        rawXml,
        requestXml,
        fault: true,
        message: `Could not parse response: ${(err as Error).message}`,
      } satisfies ServiceListResponse);
      return;
    }

    const faultString = extractFaultString(rawXml);
    if (faultString) {
      parsed.fault = true;
      parsed.message = faultString;
    } else if (parsed.services.length === 0) {
      parsed.message = "No optional services returned for this request.";
    }

    // Guarantee the Services tab is never empty: when the live endpoint returns
    // no services (fault or empty), fall back to the attached sample services so
    // a representative upgrade list is always shown. The live raw response is
    // still preserved in the Response XML tab for transparency.
    if (ALWAYS_SHOW_SERVICES && parsed.services.length === 0) {
      const sample = parseServiceListRS(SAMPLE_RESPONSE_XML, requestXml);
      parsed.services = sample.services;
      parsed.currencyCode = parsed.currencyCode || sample.currencyCode;
      parsed.currencyDecimals = parsed.currencyDecimals || sample.currencyDecimals;
      parsed.fallback = true;
      parsed.message = faultString
        ? `Live endpoint returned "${faultString}" for these inputs — showing representative sample services.`
        : "No live services for these inputs — showing representative sample services.";
    }

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ message: `Server error: ${(err as Error).message}` });
  }
});
