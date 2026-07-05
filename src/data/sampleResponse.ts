export const SAMPLE_RESPONSE_XML = `<?xml version="1.0" encoding="utf-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <SOAP-ENV:Header>
        <Transaction>
            <tc>
                <pid>FLX FLX-M EK (8805/3075) STG c565</pid>
                <tid>CFA160C6-2B549D3F210</tid>
                <dt>2026-05-27T09:49:54</dt>
            </tc>
        </Transaction>
    </SOAP-ENV:Header>
    <SOAP-ENV:Body>
        <m:FlxTransactionResponse xmlns:m="http://farelogix.com/flx">
            <ServiceListRS>
                <OptionalServices>
                    <CurrencyCode NumberOfDecimals="0">AED</CurrencyCode>
                    <Service Method="D" ReasonCode="A" Type="Surcharge" ServiceCode="U" SubCode="P01">
                        <TravelerIDRef>T1</TravelerIDRef>
                        <SegmentIDRef>S1</SegmentIDRef>
                        <Description>Upgrade Y-W</Description>
                        <Amount>590</Amount>
                        <ServicePrice Total="590">
                            <BasePrice Amount="500"></BasePrice>
                            <Taxes Amount="90">
                                <Tax Amount="90">
                                    <Designator>K3</Designator>
                                    <Nature>IN</Nature>
                                    <Description>K3 Tax</Description>
                                </Tax>
                            </Taxes>
                            <FiledIn>
                                <CurrencyCode NumberOfDecimals="2" Rate="3.67336297" Table="BSR">USD</CurrencyCode>
                                <Amount>13500</Amount>
                                <DispAmount>135.00</DispAmount>
                            </FiledIn>
                        </ServicePrice>
                        <ServicePriceCalc>
                            <Operation Seq="1" Env="3" Type="Discount">
                                <Adjustment Input="135.00" Result="135.00" Curr="USD">-0.00</Adjustment>
                                <Converted Input="496" Result="496" Curr="AED">-0</Converted>
                            </Operation>
                        </ServicePriceCalc>
                        <MktGridDiagnosticsID>Y-W146</MktGridDiagnosticsID>
                        <BookingInstructions>
                            <Method>API</Method>
                            <UpgradeMethod NewCabin="W">A</UpgradeMethod>
                        </BookingInstructions>
                        <Rules>
                            <Category Type="Remark" Code="SVC">
                                <RuleText>
                                    <Text>Chauffer Drive, Baggage allowance, Lounge access, Skywards benefits will apply as per the original booking class, not the upgraded class</Text>
                                </RuleText>
                            </Category>
                            <Category Type="Remark" Code="OTH">
                                <RuleText>
                                    <Text>A further upgrade using Skywards Miles or a combination of any two upgrade products is not permitted</Text>
                                </RuleText>
                            </Category>
                            <Category Type="Refund" Code="NRF">
                                <RuleText>
                                    <Text>The upgrade once purchased is non-changeable and non-refundable,  except in case of involuntary operational reasons. The upgrade is non-transferable at anytime.</Text>
                                </RuleText>
                                <Allowed>N</Allowed>
                            </Category>
                        </Rules>
                        <Diagnostics ID="000002B24746687F"></Diagnostics>
                    </Service>
                    <Service Method="D" ReasonCode="A" Type="Surcharge" ServiceCode="U" SubCode="P01">
                        <TravelerIDRef>T1</TravelerIDRef>
                        <SegmentIDRef>S1</SegmentIDRef>
                        <Description>Upgrade Y-C</Description>
                        <Amount>1389</Amount>
                        <ServicePrice Total="1389">
                            <BasePrice Amount="1240"></BasePrice>
                            <Taxes Amount="149">
                                <Tax Amount="149">
                                    <Designator>K3</Designator>
                                    <Nature>IN</Nature>
                                    <Description>K3 Tax</Description>
                                </Tax>
                            </Taxes>
                            <FiledIn>
                                <CurrencyCode NumberOfDecimals="2" Rate="3.67336297" Table="BSR">USD</CurrencyCode>
                                <Amount>33500</Amount>
                                <DispAmount>335.00</DispAmount>
                            </FiledIn>
                        </ServicePrice>
                        <ServicePriceCalc>
                            <Operation Seq="1" Env="3" Type="Discount">
                                <Adjustment Input="335.00" Result="335.00" Curr="USD">-0.00</Adjustment>
                                <Converted Input="1231" Result="1231" Curr="AED">-0</Converted>
                            </Operation>
                        </ServicePriceCalc>
                        <MktGridDiagnosticsID>Y-J29</MktGridDiagnosticsID>
                        <BookingInstructions>
                            <Method>API</Method>
                            <UpgradeMethod NewCabin="C">A</UpgradeMethod>
                        </BookingInstructions>
                        <Rules>
                            <Category Type="Remark" Code="SVC">
                                <RuleText>
                                    <Text>Chauffer Drive, Baggage allowance, Lounge access, Skywards benefits will apply as per the original booking class, not the upgraded class</Text>
                                </RuleText>
                            </Category>
                            <Category Type="Remark" Code="OTH">
                                <RuleText>
                                    <Text>A further upgrade using Skywards Miles or a combination of any two upgrade products is not permitted</Text>
                                </RuleText>
                            </Category>
                            <Category Type="Refund" Code="NRF">
                                <RuleText>
                                    <Text>The upgrade once purchased is non-changeable and non-refundable,  except in case of involuntary operational reasons. The upgrade is non-transferable at anytime.</Text>
                                </RuleText>
                                <Allowed>N</Allowed>
                            </Category>
                        </Rules>
                        <Diagnostics ID="000002B247570B55"></Diagnostics>
                    </Service>
                </OptionalServices>
            </ServiceListRS>
        </m:FlxTransactionResponse>
    </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
