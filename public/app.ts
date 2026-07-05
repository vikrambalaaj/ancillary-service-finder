import type {
  ServiceListRequest,
  ServiceListResponse,
  OptionalService,
  RuleCategory,
} from "../src/types.js";

// ---- Global error surface: never fail silently ----
function showGlobalError(msg: string) {
  const el = document.getElementById("globalError");
  if (!el) return;
  el.textContent = `App error: ${msg}. Try a hard refresh (Cmd/Ctrl + Shift + R).`;
  el.classList.remove("hidden");
}
window.addEventListener("error", (e) => showGlobalError(e.message || String(e.error)));
window.addEventListener("unhandledrejection", (e) =>
  showGlobalError((e.reason && (e.reason.message || String(e.reason))) || "Unhandled promise rejection"),
);

interface OptionList {
  value: string;
  label: string;
}

interface OptionsPayload {
  options: {
    airports: OptionList[];
    countries: OptionList[];
    airlines: OptionList[];
    channels: OptionList[];
    cabins: OptionList[];
    classOfService: OptionList[];
    equipment: OptionList[];
    yesNo: OptionList[];
  };
  demo: ServiceListRequest;
  endpoint: string;
  usingSample: boolean;
  airportCountry: Record<string, string>;
}

type FieldType = "text" | "select" | "date" | "time" | "number" | "password";

interface FieldDef {
  id: string;
  label: string;
  group: "tc" | "sale" | "flight" | "pricing";
  path: keyof ServiceListRequest | string;
  type: FieldType;
  options?: string;
  required?: boolean;
  full?: boolean;
  placeholder?: string;
}

const fields: FieldDef[] = [
  // Transaction Control
  { id: "tc.app", label: "App", group: "tc", path: "transactionControl.app", type: "text", required: true, placeholder: "FMS2_EK" },
  { id: "tc.idenUser", label: "Identity User", group: "tc", path: "transactionControl.idenUser", type: "text", required: true },
  { id: "tc.idenPassword", label: "Identity Password", group: "tc", path: "transactionControl.idenPassword", type: "password", required: true },
  { id: "tc.trace", label: "Trace", group: "tc", path: "transactionControl.trace", type: "text", required: true },
  { id: "tc.transactionIdentifier", label: "Transaction Identifier", group: "tc", path: "transactionControl.transactionIdentifier", type: "text", required: true, full: true },
  { id: "tc.providerEnv", label: "Provider Env", group: "tc", path: "transactionControl.providerEnv", type: "text", required: true, full: true },

  // Sale Info / Booking
  { id: "recordLocator", label: "Record Locator (PNR)", group: "sale", path: "recordLocator", type: "text", required: true, placeholder: "6 chars" },
  { id: "sale.cityCode", label: "City Code", group: "sale", path: "saleInfo.cityCode", type: "select", options: "airports", required: true },
  { id: "sale.countryCode", label: "Country Code", group: "sale", path: "saleInfo.countryCode", type: "select", options: "countries", required: true },
  { id: "sale.channel", label: "Channel", group: "sale", path: "saleInfo.channel", type: "select", options: "channels", required: true },
  { id: "sale.pointOfOrigin", label: "Point of Origin", group: "sale", path: "saleInfo.pointOfOrigin", type: "select", options: "airports", required: true },

  // Flight
  { id: "flight.associationId", label: "Association ID", group: "flight", path: "flight.associationId", type: "text", required: true, placeholder: "S1" },
  { id: "flight.airlineCode", label: "Airline Code", group: "flight", path: "flight.airlineCode", type: "select", options: "airlines", required: true },
  { id: "flight.flightNumber", label: "Flight Number", group: "flight", path: "flight.flightNumber", type: "number", required: true },
  { id: "flight.flightNumberSuffix", label: "Flight Number Suffix", group: "flight", path: "flight.flightNumberSuffix", type: "text" },
  { id: "flight.departureAirport", label: "Departure Airport", group: "flight", path: "flight.departureAirport", type: "select", options: "airports", required: true },
  { id: "flight.departureDate", label: "Departure Date", group: "flight", path: "flight.departureDate", type: "date", required: true },
  { id: "flight.departureTime", label: "Departure Time", group: "flight", path: "flight.departureTime", type: "time", required: true },
  { id: "flight.arrivalAirport", label: "Arrival Airport", group: "flight", path: "flight.arrivalAirport", type: "select", options: "airports", required: true },
  { id: "flight.arrivalDate", label: "Arrival Date", group: "flight", path: "flight.arrivalDate", type: "date", required: true },
  { id: "flight.arrivalTime", label: "Arrival Time", group: "flight", path: "flight.arrivalTime", type: "time", required: true },
  { id: "flight.cabin", label: "Cabin", group: "flight", path: "flight.cabin", type: "select", options: "cabins", required: true },
  { id: "flight.classOfService", label: "Class of Service", group: "flight", path: "flight.classOfService", type: "select", options: "classOfService", required: true },
  { id: "flight.equipmentName", label: "Equipment", group: "flight", path: "flight.equipmentName", type: "select", options: "equipment", required: true, full: true },

  // Pricing
  { id: "pricing.showNotEligibleItems", label: "Show Not Eligible Items", group: "pricing", path: "pricingInfo.showNotEligibleItems", type: "select", options: "yesNo", required: true },
  { id: "pricing.taxes", label: "Taxes", group: "pricing", path: "pricingInfo.taxes", type: "select", options: "yesNo", required: true },
];

const groupContainers: Record<FieldDef["group"], string> = {
  tc: "tcFields",
  sale: "saleFields",
  flight: "flightFields",
  pricing: "pricingFields",
};

let optionsData: OptionsPayload["options"];
let demoData: ServiceListRequest;
let airportCountry: Record<string, string> = {};
let lastResponse: ServiceListResponse | null = null;

const form = document.getElementById("requestForm") as HTMLFormElement;
const searchBtn = document.getElementById("searchBtn") as HTMLButtonElement;
const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;
const demoToggle = document.getElementById("demoToggle") as HTMLInputElement;
const demoLabel = document.getElementById("demoLabel") as HTMLSpanElement;

function resolveOptions(key?: string): OptionList[] {
  if (!key || !optionsData) return [];
  return (optionsData as unknown as Record<string, OptionList[]>)[key] ?? [];
}

function buildFieldEl(def: FieldDef): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "field" + (def.full ? " full" : "");
  wrap.dataset.id = def.id;

  const label = document.createElement("label");
  label.htmlFor = `f-${def.id}`;
  label.innerHTML = `${def.label}${def.required ? ' <span class="req">*</span>' : ""}`;
  wrap.appendChild(label);

  let input: HTMLInputElement | HTMLSelectElement;
  if (def.type === "select") {
    const sel = document.createElement("select");
    sel.id = `f-${def.id}`;
    sel.name = def.id;
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "-- select --";
    sel.appendChild(placeholder);
    for (const o of resolveOptions(def.options)) {
      const opt = document.createElement("option");
      opt.value = o.value;
      opt.textContent = o.label;
      sel.appendChild(opt);
    }
    input = sel;
  } else {
    const inp = document.createElement("input");
    inp.id = `f-${def.id}`;
    inp.name = def.id;
    inp.type = def.type;
    if (def.placeholder) inp.placeholder = def.placeholder;
    if (def.type === "number") inp.step = "1";
    input = inp;
  }
  input.addEventListener("input", () => clearFieldError(def.id));
  wrap.appendChild(input);

  const err = document.createElement("span");
  err.className = "err";
  err.id = `err-${def.id}`;
  wrap.appendChild(err);

  return wrap;
}

function renderForm() {
  for (const def of fields) {
    const container = document.getElementById(groupContainers[def.group])!;
    container.appendChild(buildFieldEl(def));
  }
}

function setFieldValue(id: string, value: string) {
  const el = document.getElementById(`f-${id}`) as HTMLInputElement | HTMLSelectElement | null;
  if (el) el.value = value;
}

function getFieldValue(id: string): string {
  const el = document.getElementById(`f-${id}`) as HTMLInputElement | HTMLSelectElement | null;
  return el ? (el.value as string) : "";
}

function clearFieldError(id: string) {
  const wrap = document.querySelector(`.field[data-id="${id}"]`);
  if (wrap) wrap.classList.remove("invalid");
  const err = document.getElementById(`err-${id}`);
  if (err) err.textContent = "";
}

function setFieldError(id: string, msg: string) {
  const wrap = document.querySelector(`.field[data-id="${id}"]`);
  if (wrap) wrap.classList.add("invalid");
  const err = document.getElementById(`err-${id}`);
  if (err) err.textContent = msg;
}

function setValueByPath(obj: ServiceListRequest, path: string, value: string) {
  const parts = path.split(".");
  let cur: Record<string, unknown> = obj as unknown as Record<string, unknown>;
  for (let i = 0; i < parts.length - 1; i++) {
    cur[parts[i]] ??= {};
    cur = cur[parts[i]] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

function collectForm(): ServiceListRequest {
  const req = {} as ServiceListRequest;
  for (const def of fields) {
    setValueByPath(req, def.path as string, getFieldValue(def.id));
  }
  return req;
}

function fillFormFromRequest(req: ServiceListRequest) {
  for (const def of fields) {
    const parts = (def.path as string).split(".");
    let cur: unknown = req;
    for (const p of parts) {
      cur = (cur as Record<string, unknown>)?.[p];
    }
    setFieldValue(def.id, String(cur ?? ""));
  }
  fields.forEach((f) => clearFieldError(f.id));
}

function clearForm() {
  for (const def of fields) setFieldValue(def.id, "");
  fields.forEach((f) => clearFieldError(f.id));
}

// ---- Tabs ----
document.getElementById("tabs")!.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest(".tab") as HTMLButtonElement | null;
  if (!btn) return;
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  btn.classList.add("active");
  document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
  document.getElementById(btn.dataset.tab!)!.classList.add("active");
});

// ---- Result rendering ----
function escapeHtml(s: unknown): string {
  if (s === undefined || s === null) return "";
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
}

function renderServiceCard(s: OptionalService, currencyLabel: string): string {
  const rulesArr = Array.isArray(s.rules) ? s.rules : [];
  const rules = rulesArr
    .map((r: RuleCategory) => {
      const cls = r.type === "Refund" ? "" : "remark";
      const allowed = r.allowed ? ` &middot; Allowed: <strong>${escapeHtml(r.allowed)}</strong>` : "";
      return `<div class="rule"><span class="tag ${cls}">${escapeHtml(r.type)} / ${escapeHtml(r.code)}</span>${escapeHtml(r.text)}${allowed}</div>`;
    })
    .join("");

  const taxesArr = Array.isArray(s.taxes) ? s.taxes : [];
  const taxes = taxesArr
    .map((t) => `<div><span>Tax ${escapeHtml(t.designator)}</span><span>${escapeHtml(t.amount)}</span></div>`)
    .join("");

  return `
    <div class="service-card">
      <div class="top">
        <div class="desc">${escapeHtml(s.description)}</div>
        <div class="price">${s.amount} <small>${escapeHtml(currencyLabel)}</small></div>
      </div>
      <div class="badges">
        <span class="badge cabin">→ ${escapeHtml(s.upgradeNewCabin)}</span>
        <span class="badge">${escapeHtml(s.method)} &middot; ${escapeHtml(s.type)}</span>
        <span class="badge">SubCode ${escapeHtml(s.subCode)}</span>
        <span class="badge">Traveler ${escapeHtml(s.travelerIdRef)} &middot; Segment ${escapeHtml(s.segmentIdRef)}</span>
      </div>
      <div class="kv">
        <div><span>Total Price</span><span>${s.servicePriceTotal}</span></div>
        <div><span>Base Price</span><span>${s.basePrice}</span></div>
        <div><span>Total Taxes</span><span>${s.taxesTotal}</span></div>
        <div><span>Booking Method</span><span>${escapeHtml(s.bookingMethod)}</span></div>
        <div><span>Upgrade Method</span><span>${escapeHtml(s.upgradeMethod)}</span></div>
        <div><span>Mkt Grid</span><span>${escapeHtml(s.mktGridDiagnosticsId)}</span></div>
        <div><span>Filed In</span><span>${escapeHtml(s.filedInDispAmount)} ${escapeHtml(s.filedInCurrency)} @ ${escapeHtml(s.filedInRate)}</span></div>
        <div><span>Diagnostics</span><span>${escapeHtml(s.diagnosticsId)}</span></div>
      </div>
      ${taxes ? `<div class="kv">${taxes}</div>` : ""}
      ${rules ? `<div class="rules">${rules}</div>` : ""}
    </div>`;
}

function renderResponse(resp: ServiceListResponse) {
  lastResponse = resp;
  const cardsEl = document.getElementById("resultCards")!;
  const respXmlEl = document.getElementById("responseXml")!;
  const reqXmlEl = document.getElementById("requestXml")!;
  const empty = document.getElementById("emptyState")!;

  const currencyLabel = `${resp.currencyCode}`;
  const services = resp.services || [];

  if (services.length === 0) {
    const title = resp.fault ? "No services found" : "No optional services returned";
    const detail = resp.message ? escapeHtml(resp.message) : "The endpoint returned no upgrade services for this request.";
    cardsEl.innerHTML = `<div class="empty">
      <p class="no-svc-title">${title}</p>
      <p class="muted">${detail}</p>
      <p class="muted hint-box">This usually means no upgrade is available for the selected inputs —
        e.g. <strong>Cabin is already J or F</strong> (no higher cabin to upgrade to),
        or <strong>Channel is not RCC</strong>. Try <strong>Cabin Y / W / C</strong> with <strong>Channel RCC</strong>.</p>
    </div>`;
    toast(resp.message || "No services found for this request.", "err");
  } else {
    try {
      const notice = resp.fallback
        ? `<div class="fallback-note">${escapeHtml(resp.message || "Showing representative sample services.")}</div>`
        : "";
      cardsEl.innerHTML = notice + services.map((s) => renderServiceCard(s, currencyLabel)).join("");
      toast(resp.fallback ? "Showing sample services (no live results)." : `${services.length} service(s) received.`, resp.fallback ? "err" : "ok");
    } catch (err) {
      // Never blank the panel on a render error — show raw data instead.
      cardsEl.innerHTML = `<div class="empty">
        <p class="no-svc-title">Rendered with fallback</p>
        <p class="muted">${escapeHtml(services.length)} service(s) received but a display error occurred: ${escapeHtml((err as Error).message)}</p>
        <pre class="xml">${escapeHtml(JSON.stringify(services, null, 2))}</pre>
      </div>`;
    }
  }
  respXmlEl.textContent = resp.rawXml || "";
  reqXmlEl.textContent = resp.requestXml || "";
  empty.classList.add("hidden");
}

// ---- Submit ----
async function submitRequest(req: ServiceListRequest) {
  const loading = document.getElementById("loading")!;
  const empty = document.getElementById("emptyState")!;
  loading.classList.remove("hidden");
  empty.classList.add("hidden");
  searchBtn.disabled = true;
  try {
    const res = await fetch("/api/servicelist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.errors) {
        for (const def of fields) clearFieldError(def.id);
        for (const [key, msg] of Object.entries(data.errors as Record<string, string>)) {
          setFieldError(key, msg);
        }
        showValidationSummary(data.errors as Record<string, string>);
        toast("Validation failed — see summary below the form.", "err");
      } else {
        hideValidationSummary();
        toast(data.message || "Request failed.", "err");
      }
      return;
    }
    hideValidationSummary();
    renderResponse(data as ServiceListResponse);
    toast("Response received.", "ok");
  } catch (err) {
    toast(`Network error: ${(err as Error).message}`, "err");
  } finally {
    loading.classList.add("hidden");
    searchBtn.disabled = false;
  }
}

// ---- Validation summary ----
const sectionNames: Record<string, string> = {
  tc: "Transaction Control",
  recordLocator: "Booking & Sale Info",
  sale: "Booking & Sale Info",
  flight: "Flight Segment",
  pricing: "Pricing Options",
};

function showValidationSummary(errors: Record<string, string>) {
  const el = document.getElementById("validationSummary")!;
  const keys = Object.keys(errors);
  const sections = [...new Set(keys.map((k) => sectionNames[k.split(".")[0]] ?? k.split(".")[0]))];
  el.innerHTML = `<strong>${keys.length} mandatory field(s) missing.</strong>
    Please complete the highlighted fields in: <span class="sections">${sections.join(", ")}</span>`;
  el.classList.remove("hidden");
  // Scroll to the first invalid field.
  const firstKey = keys[0];
  const firstEl = document.getElementById(`f-${firstKey}`);
  if (firstEl) firstEl.scrollIntoView({ behavior: "smooth", block: "center" });
}

function hideValidationSummary() {
  document.getElementById("validationSummary")!.classList.add("hidden");
}

// ---- Fill missing required fields from demo data ----
document.getElementById("fillMissingBtn")!.addEventListener("click", () => {
  if (!demoData) return;
  let filled = 0;
  for (const def of fields) {
    if (!def.required) continue;
    const cur = getFieldValue(def.id).trim();
    if (!cur) {
      const parts = (def.path as string).split(".");
      let v: unknown = demoData;
      for (const p of parts) v = (v as Record<string, unknown>)?.[p];
      if (v) {
        setFieldValue(def.id, String(v));
        filled++;
      }
    }
    clearFieldError(def.id);
  }
  hideValidationSummary();
  toast(filled ? `Filled ${filled} missing field(s) from sample data.` : "No missing required fields.", filled ? "ok" : "err");
});

// ---- Form events ----
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const req = collectForm();
  void submitRequest(req);
});

resetBtn.addEventListener("click", () => {
  if (demoToggle.checked) {
    // keep demo data but don't auto-submit
    fillFormFromRequest(demoData);
  } else {
    clearForm();
  }
  document.getElementById("resultCards")!.innerHTML = "";
  document.getElementById("responseXml")!.textContent = "";
  document.getElementById("requestXml")!.textContent = "";
  document.getElementById("emptyState")!.classList.remove("hidden");
});

// ---- Demo toggle ----
demoToggle.addEventListener("change", async () => {
  if (demoToggle.checked) {
    demoLabel.textContent = "Demo: ON";
    demoLabel.classList.add("on");
    fillFormFromRequest(demoData);
    toast("Demo ON — form auto-filled. Click Search to get the response.", "ok");
  } else {
    demoLabel.textContent = "Demo: OFF";
    demoLabel.classList.remove("on");
    clearForm();
    document.getElementById("resultCards")!.innerHTML = "";
    document.getElementById("responseXml")!.textContent = "";
    document.getElementById("requestXml")!.textContent = "";
    document.getElementById("emptyState")!.classList.remove("hidden");
    toast("Demo OFF — enter details manually.", "err");
  }
});

// ---- Toast ----
let toastTimer: ReturnType<typeof setTimeout> | undefined;
function toast(msg: string, kind: "ok" | "err" = "ok") {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const el = document.createElement("div");
  el.className = `toast ${kind}`;
  el.textContent = msg;
  document.body.appendChild(el);
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), 2600);
}

// ---- Init ----
async function init() {
  renderForm();
  const res = await fetch("/api/options");
  const data = (await res.json()) as OptionsPayload;
  optionsData = data.options;
  demoData = data.demo;
  airportCountry = data.airportCountry || {};
  // re-render selects now that options are loaded
  for (const def of fields) {
    if (def.type !== "select") continue;
    const container = document.getElementById(groupContainers[def.group])!;
    const old = container.querySelector(`.field[data-id="${def.id}"]`);
    if (old) old.replaceWith(buildFieldEl(def));
  }
  // Auto-link Country to the selected City to prevent mismatches.
  const citySel = document.getElementById("f-sale.cityCode") as HTMLSelectElement | null;
  const countrySel = document.getElementById("f-sale.countryCode") as HTMLSelectElement | null;
  if (citySel && countrySel) {
    citySel.addEventListener("change", () => {
      const c = airportCountry[citySel.value];
      if (c) {
        countrySel.value = c;
        clearFieldError("sale.countryCode");
      }
    });
  }
  // Show the configured endpoint
  const ep = document.getElementById("endpointInfo")!;
  if (data.usingSample) {
    ep.classList.add("sample");
    ep.innerHTML = '<span class="dot"></span>Using sample response (offline mode)';
  } else {
    ep.classList.remove("sample");
    ep.innerHTML = `<span class="dot"></span>Live: ${escapeHtml(data.endpoint)}`;
  }
}

void init().catch((err) => showGlobalError((err as Error).message));
