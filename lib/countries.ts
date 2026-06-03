import { countryName } from "./utils";

/** ISO 3166-1 alpha-2 codes (sanctioned/embargoed omitted from checkout). */
const CODES = [
  "AD","AE","AF","AG","AL","AM","AO","AR","AT","AU","AZ","BA","BB","BD","BE",
  "BF","BG","BH","BI","BJ","BN","BO","BR","BS","BT","BW","BZ","CA","CD","CG",
  "CH","CI","CL","CM","CN","CO","CR","CV","CY","CZ","DE","DJ","DK","DM","DO",
  "DZ","EC","EE","EG","ER","ES","ET","FI","FJ","FR","GA","GB","GD","GE","GH",
  "GM","GN","GQ","GR","GT","GW","GY","HN","HR","HT","HU","ID","IE","IL","IN",
  "IQ","IS","IT","JM","JO","JP","KE","KG","KH","KI","KM","KN","KR","KW","KZ",
  "LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY","MA","MC","MD","ME",
  "MG","MH","MK","ML","MM","MN","MR","MT","MU","MV","MW","MX","MY","MZ","NA",
  "NE","NG","NI","NL","NO","NP","NR","NZ","OM","PA","PE","PG","PH","PL","PT",
  "PW","PY","QA","RO","RS","RW","SA","SB","SC","SD","SE","SG","SI","SK","SL",
  "SM","SN","SO","SR","SS","ST","SV","SZ","TD","TG","TH","TJ","TL","TM","TN",
  "TO","TR","TT","TV","TZ","UA","UG","US","UY","UZ","VC","VE","VN","VU","WS",
  "YE","ZA","ZM","ZW",
];

export interface Country {
  code: string;
  name: string;
}

/** Alphabetically-sorted country list with localized display names. */
export const COUNTRIES: Country[] = CODES.map((code) => ({
  code,
  name: countryName(code),
})).sort((a, b) => a.name.localeCompare(b.name));
