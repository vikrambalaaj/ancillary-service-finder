import type { ServiceListRequest } from "../types.js";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Builds the Farelogix ServiceListRQ SOAP envelope from structured form data.
 * Mirrors the attached valid request exactly.
 */
export function buildServiceListRQ(req: ServiceListRequest): string {
  const tc = req.transactionControl;
  const s = req.saleInfo;
  const f = req.flight;
  const p = req.pricingInfo;

  const flightSuffixAttr = f.flightNumberSuffix
    ? ` Suffix="${esc(f.flightNumberSuffix)}"`
    : "";

  return `<?xml version="1.0" encoding="utf-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
	<SOAP-ENV:Header>
		<ns6:TransactionControl xmlns:m="http://farelogix.com/flx" xmlns:ns2="http://farelogix.com/flx/ServiceListRQ" xmlns:ns3="http://farelogix.com/flx/FlxTransaction" xmlns:ns4="http://farelogix.com/flx/ServiceListRS" xmlns:ns6="http://farelogix.com/flx/tc">
			<ns6:tc>
				<ns6:app>${esc(tc.app)}</ns6:app>
				<ns6:iden p="${esc(tc.idenPassword)}" u="${esc(tc.idenUser)}"/>
				<ns6:provider env="${esc(tc.providerEnv)}">FMS2</ns6:provider>
				<ns6:trace>${esc(tc.trace)}</ns6:trace>
			</ns6:tc>
		</ns6:TransactionControl>
	</SOAP-ENV:Header>
	<SOAP-ENV:Body>
		<ns3:FlxTransaction xmlns:m="http://farelogix.com/flx" xmlns:ns3="http://farelogix.com/flx/ServiceListRQ" xmlns:ns4="http://farelogix.com/flx/FlxTransaction" xmlns:ns5="http://farelogix.com/flx/ServiceListRS" xmlns:ns7="http://farelogix.com/flx/tc">
			<ns3:ServiceListRQ TransactionIdentifier="${esc(tc.transactionIdentifier)}">
				<ns3:RecordLocator>${esc(req.recordLocator)}</ns3:RecordLocator>
				<ns3:SaleInfo>
					<ns3:CityCode>${esc(s.cityCode)}</ns3:CityCode>
					<ns3:CountryCode>${esc(s.countryCode)}</ns3:CountryCode>
					<ns3:Channel>${esc(s.channel)}</ns3:Channel>
					<ns3:PointOfOrigin>${esc(s.pointOfOrigin)}</ns3:PointOfOrigin>
				</ns3:SaleInfo>
				<ns3:Flight AssociationID="${esc(f.associationId)}">
					<ns3:AirlineCode>${esc(f.airlineCode)}</ns3:AirlineCode>
					<ns3:FlightNumber${flightSuffixAttr}>${esc(f.flightNumber)}</ns3:FlightNumber>
					<ns3:Departure>
						<ns3:AirportCode>${esc(f.departureAirport)}</ns3:AirportCode>
						<ns3:Date>${esc(f.departureDate)}</ns3:Date>
						<ns3:Time>${esc(f.departureTime)}</ns3:Time>
					</ns3:Departure>
					<ns3:Arrival>
						<ns3:AirportCode>${esc(f.arrivalAirport)}</ns3:AirportCode>
						<ns3:Date>${esc(f.arrivalDate)}</ns3:Date>
						<ns3:Time>${esc(f.arrivalTime)}</ns3:Time>
					</ns3:Arrival>
					<ns3:Cabin>${esc(f.cabin)}</ns3:Cabin>
					<ns3:ClassOfService>${esc(f.classOfService)}</ns3:ClassOfService>
					<ns3:Equipment>
						<ns3:Name>${esc(f.equipmentName)}</ns3:Name>
					</ns3:Equipment>
				</ns3:Flight>
				<ns3:PricingInfo ShowNotEligibleItems="${esc(p.showNotEligibleItems)}" Taxes="${esc(p.taxes)}"/>
			</ns3:ServiceListRQ>
		</ns3:FlxTransaction>
	</SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
}
