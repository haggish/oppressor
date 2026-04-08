/**
 * Fritz!Box TR-064 SOAP client
 *
 * Handles authentication and device access control via the
 * X_AVM-DE_HostFilter and Hosts services.
 */

const FRITZ_HOST = process.env.FRITZ_HOST || "192.168.178.1";
const FRITZ_USER = process.env.FRITZ_USER || "admin";
const FRITZ_PASSWORD = process.env.FRITZ_PASSWORD || "";

interface SoapOptions {
  service: string;
  action: string;
  params?: Record<string, string>;
}

async function soapRequest({ service, action, params = {} }: SoapOptions): Promise<string> {
  const serviceUrl = `https://${FRITZ_HOST}:49443/upnp/control/${service}`;
  const serviceType = `urn:dslforum-org:service:${service}:1`;

  const paramXml = Object.entries(params)
    .map(([key, val]) => `<${key}>${val}</${key}>`)
    .join("");

  const envelope = `<?xml version="1.0" encoding="utf-8"?>
    <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"
                s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
      <s:Body>
        <u:${action} xmlns:u="${serviceType}">
          ${paramXml}
        </u:${action}>
      </s:Body>
    </s:Envelope>`;

  const response = await fetch(serviceUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: `${serviceType}#${action}`,
      Authorization: `Basic ${btoa(`${FRITZ_USER}:${FRITZ_PASSWORD}`)}`,
    },
    body: envelope,
    tls: { rejectUnauthorized: false }, // Fritz!Box uses self-signed certs
  });

  return response.text();
}

/** Get all hosts (devices) known to the Fritz!Box */
export async function getHosts() {
  const countXml = await soapRequest({
    service: "Hosts",
    action: "GetHostNumberOfEntries",
  });

  const countMatch = countXml.match(/<NewHostNumberOfEntries>(\d+)<\/NewHostNumberOfEntries>/);
  const count = countMatch ? parseInt(countMatch[1]!) : 0;

  const hosts = [];
  for (let i = 0; i < count; i++) {
    const hostXml = await soapRequest({
      service: "Hosts",
      action: "GetGenericHostEntry",
      params: { NewIndex: String(i) },
    });

    hosts.push({
      mac: extractXmlValue(hostXml, "NewMACAddress"),
      ip: extractXmlValue(hostXml, "NewIPAddress"),
      hostname: extractXmlValue(hostXml, "NewHostName"),
      active: extractXmlValue(hostXml, "NewActive") === "1",
      interfaceType: extractXmlValue(hostXml, "NewInterfaceType"),
    });
  }

  return hosts;
}

/** Block internet access for a device by MAC address */
export async function blockDevice(mac: string): Promise<boolean> {
  try {
    await soapRequest({
      service: "X_AVM-DE_HostFilter",
      action: "DisallowWANAccessByIP",
      params: { NewIPAddress: mac },
    });
    return true;
  } catch (err) {
    console.error(`Failed to block ${mac}:`, err);
    return false;
  }
}

/** Unblock internet access for a device by MAC address */
export async function unblockDevice(mac: string): Promise<boolean> {
  try {
    await soapRequest({
      service: "X_AVM-DE_HostFilter",
      action: "AllowWANAccessByIP",
      params: { NewIPAddress: mac },
    });
    return true;
  } catch (err) {
    console.error(`Failed to unblock ${mac}:`, err);
    return false;
  }
}

/** Exported for testing */
export function extractXmlValue(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return match ? match[1]! : "";
}
