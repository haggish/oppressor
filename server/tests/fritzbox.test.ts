import { describe, expect, it } from "bun:test";
import { extractXmlValue } from "../services/fritzbox";

describe("extractXmlValue", () => {
  const xml = `
    <s:Envelope>
      <s:Body>
        <NewMACAddress>AA:BB:CC:DD:EE:FF</NewMACAddress>
        <NewIPAddress>192.168.178.42</NewIPAddress>
        <NewHostName>my-laptop</NewHostName>
        <NewActive>1</NewActive>
        <NewInterfaceType>802.11</NewInterfaceType>
        <NewEmpty></NewEmpty>
      </s:Body>
    </s:Envelope>
  `;

  it("extracts a present tag value", () => {
    expect(extractXmlValue(xml, "NewMACAddress")).toBe("AA:BB:CC:DD:EE:FF");
    expect(extractXmlValue(xml, "NewIPAddress")).toBe("192.168.178.42");
    expect(extractXmlValue(xml, "NewHostName")).toBe("my-laptop");
    expect(extractXmlValue(xml, "NewActive")).toBe("1");
  });

  it("returns empty string for a missing tag", () => {
    expect(extractXmlValue(xml, "NewNonExistent")).toBe("");
  });

  it("returns empty string for an empty tag", () => {
    expect(extractXmlValue(xml, "NewEmpty")).toBe("");
  });

  it("parses host count from GetHostNumberOfEntries response", () => {
    const countXml = `<NewHostNumberOfEntries>14</NewHostNumberOfEntries>`;
    expect(extractXmlValue(countXml, "NewHostNumberOfEntries")).toBe("14");
  });
});
