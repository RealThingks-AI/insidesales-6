/**
 * Shared country-region mapping utility.
 * Covers 7 geographic regions, ~200 countries, and formatted timezones.
 */

// Geographic regions
export const regions = [
  "Africa",
  "Asia",
  "Europe",
  "Middle East",
  "North America",
  "Oceania",
  "South America",
];

// All countries grouped by region, alphabetically sorted within each region
export const countries = [
  // Africa
  "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cameroon", "Central African Republic", "Chad", "Comoros",
  "Congo", "Côte d'Ivoire", "DR Congo", "Djibouti", "Egypt",
  "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia",
  "Ghana", "Guinea", "Guinea-Bissau", "Kenya", "Lesotho", "Liberia", "Libya",
  "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco",
  "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "São Tomé and Príncipe",
  "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa",
  "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia",
  "Zimbabwe",
  // Asia
  "Afghanistan", "Bangladesh", "Bhutan", "Brunei", "Cambodia", "China",
  "India", "Indonesia", "Japan", "Kazakhstan", "Kyrgyzstan", "Laos",
  "Malaysia", "Maldives", "Mongolia", "Myanmar", "Nepal", "North Korea",
  "Pakistan", "Philippines", "Singapore", "South Korea", "Sri Lanka",
  "Taiwan", "Tajikistan", "Thailand", "Timor-Leste", "Turkmenistan",
  "Uzbekistan", "Vietnam",
  // Europe
  "Albania", "Andorra", "Armenia", "Austria", "Azerbaijan", "Belarus",
  "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus",
  "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Georgia",
  "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Kosovo",
  "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Moldova",
  "Monaco", "Montenegro", "Netherlands", "North Macedonia", "Norway",
  "Poland", "Portugal", "Romania", "Russia", "San Marino", "Serbia",
  "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Turkey",
  "UK", "Ukraine", "Vatican City",
  // Middle East
  "Bahrain", "Iran", "Iraq", "Israel", "Jordan", "Kuwait", "Lebanon",
  "Oman", "Palestine", "Qatar", "Saudi Arabia", "Syria", "UAE", "Yemen",
  // North America
  "Antigua and Barbuda", "Bahamas", "Barbados", "Belize", "Canada",
  "Costa Rica", "Cuba", "Dominica", "Dominican Republic", "El Salvador",
  "Grenada", "Guatemala", "Haiti", "Honduras", "Jamaica", "Mexico",
  "Nicaragua", "Panama", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Trinidad and Tobago", "USA",
  // Oceania
  "Australia", "Fiji", "Kiribati", "Marshall Islands", "Micronesia",
  "Nauru", "New Zealand", "Palau", "Papua New Guinea", "Samoa",
  "Solomon Islands", "Tonga", "Tuvalu", "Vanuatu",
  // South America
  "Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador",
  "Guyana", "Paraguay", "Peru", "Suriname", "Uruguay", "Venezuela",
];

// Map every country to its region
export const countryToRegion: Record<string, string> = {
  // Africa
  "Algeria": "Africa", "Angola": "Africa", "Benin": "Africa", "Botswana": "Africa",
  "Burkina Faso": "Africa", "Burundi": "Africa", "Cabo Verde": "Africa",
  "Cameroon": "Africa", "Central African Republic": "Africa", "Chad": "Africa",
  "Comoros": "Africa", "Congo": "Africa", "Côte d'Ivoire": "Africa",
  "DR Congo": "Africa", "Djibouti": "Africa", "Egypt": "Africa",
  "Equatorial Guinea": "Africa", "Eritrea": "Africa", "Eswatini": "Africa",
  "Ethiopia": "Africa", "Gabon": "Africa", "Gambia": "Africa", "Ghana": "Africa",
  "Guinea": "Africa", "Guinea-Bissau": "Africa", "Kenya": "Africa",
  "Lesotho": "Africa", "Liberia": "Africa", "Libya": "Africa",
  "Madagascar": "Africa", "Malawi": "Africa", "Mali": "Africa",
  "Mauritania": "Africa", "Mauritius": "Africa", "Morocco": "Africa",
  "Mozambique": "Africa", "Namibia": "Africa", "Niger": "Africa",
  "Nigeria": "Africa", "Rwanda": "Africa", "São Tomé and Príncipe": "Africa",
  "Senegal": "Africa", "Seychelles": "Africa", "Sierra Leone": "Africa",
  "Somalia": "Africa", "South Africa": "Africa", "South Sudan": "Africa",
  "Sudan": "Africa", "Tanzania": "Africa", "Togo": "Africa", "Tunisia": "Africa",
  "Uganda": "Africa", "Zambia": "Africa", "Zimbabwe": "Africa",
  // Asia
  "Afghanistan": "Asia", "Bangladesh": "Asia", "Bhutan": "Asia", "Brunei": "Asia",
  "Cambodia": "Asia", "China": "Asia", "India": "Asia", "Indonesia": "Asia",
  "Japan": "Asia", "Kazakhstan": "Asia", "Kyrgyzstan": "Asia", "Laos": "Asia",
  "Malaysia": "Asia", "Maldives": "Asia", "Mongolia": "Asia", "Myanmar": "Asia",
  "Nepal": "Asia", "North Korea": "Asia", "Pakistan": "Asia",
  "Philippines": "Asia", "Singapore": "Asia", "South Korea": "Asia",
  "Sri Lanka": "Asia", "Taiwan": "Asia", "Tajikistan": "Asia", "Thailand": "Asia",
  "Timor-Leste": "Asia", "Turkmenistan": "Asia", "Uzbekistan": "Asia",
  "Vietnam": "Asia",
  // Europe
  "Albania": "Europe", "Andorra": "Europe", "Armenia": "Europe", "Austria": "Europe",
  "Azerbaijan": "Europe", "Belarus": "Europe", "Belgium": "Europe",
  "Bosnia and Herzegovina": "Europe", "Bulgaria": "Europe", "Croatia": "Europe",
  "Cyprus": "Europe", "Czech Republic": "Europe", "Denmark": "Europe",
  "Estonia": "Europe", "Finland": "Europe", "France": "Europe", "Georgia": "Europe",
  "Germany": "Europe", "Greece": "Europe", "Hungary": "Europe", "Iceland": "Europe",
  "Ireland": "Europe", "Italy": "Europe", "Kosovo": "Europe", "Latvia": "Europe",
  "Liechtenstein": "Europe", "Lithuania": "Europe", "Luxembourg": "Europe",
  "Malta": "Europe", "Moldova": "Europe", "Monaco": "Europe",
  "Montenegro": "Europe", "Netherlands": "Europe", "North Macedonia": "Europe",
  "Norway": "Europe", "Poland": "Europe", "Portugal": "Europe", "Romania": "Europe",
  "Russia": "Europe", "San Marino": "Europe", "Serbia": "Europe",
  "Slovakia": "Europe", "Slovenia": "Europe", "Spain": "Europe", "Sweden": "Europe",
  "Switzerland": "Europe", "Turkey": "Europe", "UK": "Europe", "Ukraine": "Europe",
  "Vatican City": "Europe",
  // Middle East
  "Bahrain": "Middle East", "Iran": "Middle East", "Iraq": "Middle East",
  "Israel": "Middle East", "Jordan": "Middle East", "Kuwait": "Middle East",
  "Lebanon": "Middle East", "Oman": "Middle East", "Palestine": "Middle East",
  "Qatar": "Middle East", "Saudi Arabia": "Middle East", "Syria": "Middle East",
  "UAE": "Middle East", "Yemen": "Middle East",
  // North America
  "Antigua and Barbuda": "North America", "Bahamas": "North America",
  "Barbados": "North America", "Belize": "North America", "Canada": "North America",
  "Costa Rica": "North America", "Cuba": "North America", "Dominica": "North America",
  "Dominican Republic": "North America", "El Salvador": "North America",
  "Grenada": "North America", "Guatemala": "North America", "Haiti": "North America",
  "Honduras": "North America", "Jamaica": "North America", "Mexico": "North America",
  "Nicaragua": "North America", "Panama": "North America",
  "Saint Kitts and Nevis": "North America", "Saint Lucia": "North America",
  "Saint Vincent and the Grenadines": "North America",
  "Trinidad and Tobago": "North America", "USA": "North America",
  // Oceania
  "Australia": "Oceania", "Fiji": "Oceania", "Kiribati": "Oceania",
  "Marshall Islands": "Oceania", "Micronesia": "Oceania", "Nauru": "Oceania",
  "New Zealand": "Oceania", "Palau": "Oceania", "Papua New Guinea": "Oceania",
  "Samoa": "Oceania", "Solomon Islands": "Oceania", "Tonga": "Oceania",
  "Tuvalu": "Oceania", "Vanuatu": "Oceania",
  // South America
  "Argentina": "South America", "Bolivia": "South America", "Brazil": "South America",
  "Chile": "South America", "Colombia": "South America", "Ecuador": "South America",
  "Guyana": "South America", "Paraguay": "South America", "Peru": "South America",
  "Suriname": "South America", "Uruguay": "South America", "Venezuela": "South America",
};

/**
 * Mapping of common country name variants to the canonical name used in the system.
 */
const countryAliases: Record<string, string> = {
  // USA variants
  "united states": "USA", "united states of america": "USA", "us": "USA",
  "u.s.": "USA", "u.s.a.": "USA", "america": "USA",
  // UK variants
  "united kingdom": "UK", "great britain": "UK", "gb": "UK",
  "england": "UK", "britain": "UK",
  // Korea variants
  "korea": "South Korea", "republic of korea": "South Korea",
  "s. korea": "South Korea", "south korea": "South Korea",
  // UAE variants
  "united arab emirates": "UAE", "u.a.e.": "UAE",
  // Czech variants
  "czech": "Czech Republic", "czechia": "Czech Republic",
  // Netherlands variants
  "holland": "Netherlands", "the netherlands": "Netherlands",
  // Switzerland variants
  "swiss": "Switzerland",
  // DR Congo variants
  "democratic republic of the congo": "DR Congo", "drc": "DR Congo",
  // Congo variants
  "republic of the congo": "Congo",
  // Côte d'Ivoire variants
  "ivory coast": "Côte d'Ivoire", "cote d'ivoire": "Côte d'Ivoire",
  // Eswatini variants
  "swaziland": "Eswatini",
  // Myanmar variants
  "burma": "Myanmar",
  // North Macedonia variants
  "macedonia": "North Macedonia",
  // Timor-Leste variants
  "east timor": "Timor-Leste",
  // Russia variants
  "russian federation": "Russia",
  // Iran variants
  "islamic republic of iran": "Iran",
  // Syria variants
  "syrian arab republic": "Syria",
  // Palestine variants
  "state of palestine": "Palestine",
  // Taiwan variants
  "chinese taipei": "Taiwan",
  // New Zealand variants
  "nz": "New Zealand",
  // Brazil variants
  "brasil": "Brazil",
};

/**
 * Formatted timezone list for display in dropdowns.
 * Format: "UTC±HH:mm Timezone Name (Abbreviation)"
 */
export const TIMEZONE_LIST: { value: string; label: string }[] = [
  { value: "Pacific/Midway", label: "UTC-11:00 Samoa Standard Time (SST)" },
  { value: "Pacific/Honolulu", label: "UTC-10:00 Hawaii Standard Time (HST)" },
  { value: "America/Anchorage", label: "UTC-09:00 Alaska Standard Time (AKST)" },
  { value: "America/Los_Angeles", label: "UTC-08:00 Pacific Standard Time (PST)" },
  { value: "America/Denver", label: "UTC-07:00 Mountain Standard Time (MST)" },
  { value: "America/Chicago", label: "UTC-06:00 Central Standard Time (CST)" },
  { value: "America/New_York", label: "UTC-05:00 Eastern Standard Time (EST)" },
  { value: "America/Caracas", label: "UTC-04:30 Venezuelan Standard Time (VET)" },
  { value: "America/Halifax", label: "UTC-04:00 Atlantic Standard Time (AST)" },
  { value: "America/St_Johns", label: "UTC-03:30 Newfoundland Standard Time (NST)" },
  { value: "America/Argentina/Buenos_Aires", label: "UTC-03:00 Argentina Time (ART)" },
  { value: "America/Sao_Paulo", label: "UTC-03:00 Brasilia Time (BRT)" },
  { value: "Atlantic/South_Georgia", label: "UTC-02:00 South Georgia Time (GST)" },
  { value: "Atlantic/Azores", label: "UTC-01:00 Azores Standard Time (AZOT)" },
  { value: "UTC", label: "UTC+00:00 Coordinated Universal Time (UTC)" },
  { value: "Europe/London", label: "UTC+00:00 Greenwich Mean Time (GMT)" },
  { value: "Europe/Paris", label: "UTC+01:00 Central European Time (CET)" },
  { value: "Europe/Berlin", label: "UTC+01:00 Central European Time (CET)" },
  { value: "Africa/Lagos", label: "UTC+01:00 West Africa Time (WAT)" },
  { value: "Europe/Helsinki", label: "UTC+02:00 Eastern European Time (EET)" },
  { value: "Africa/Cairo", label: "UTC+02:00 Eastern European Time (EET)" },
  { value: "Africa/Johannesburg", label: "UTC+02:00 South Africa Standard Time (SAST)" },
  { value: "Europe/Istanbul", label: "UTC+03:00 Turkey Time (TRT)" },
  { value: "Europe/Moscow", label: "UTC+03:00 Moscow Standard Time (MSK)" },
  { value: "Asia/Riyadh", label: "UTC+03:00 Arabian Standard Time (AST)" },
  { value: "Africa/Nairobi", label: "UTC+03:00 East Africa Time (EAT)" },
  { value: "Asia/Tehran", label: "UTC+03:30 Iran Standard Time (IRST)" },
  { value: "Asia/Dubai", label: "UTC+04:00 Gulf Standard Time (GST)" },
  { value: "Asia/Kabul", label: "UTC+04:30 Afghanistan Time (AFT)" },
  { value: "Asia/Karachi", label: "UTC+05:00 Pakistan Standard Time (PKT)" },
  { value: "Asia/Tashkent", label: "UTC+05:00 Uzbekistan Time (UZT)" },
  { value: "Asia/Kolkata", label: "UTC+05:30 Indian Standard Time (IST)" },
  { value: "Asia/Kathmandu", label: "UTC+05:45 Nepal Time (NPT)" },
  { value: "Asia/Dhaka", label: "UTC+06:00 Bangladesh Standard Time (BST)" },
  { value: "Asia/Almaty", label: "UTC+06:00 Alma-Ata Time (ALMT)" },
  { value: "Asia/Yangon", label: "UTC+06:30 Myanmar Time (MMT)" },
  { value: "Asia/Bangkok", label: "UTC+07:00 Indochina Time (ICT)" },
  { value: "Asia/Jakarta", label: "UTC+07:00 Western Indonesia Time (WIB)" },
  { value: "Asia/Shanghai", label: "UTC+08:00 China Standard Time (CST)" },
  { value: "Asia/Singapore", label: "UTC+08:00 Singapore Standard Time (SGT)" },
  { value: "Asia/Hong_Kong", label: "UTC+08:00 Hong Kong Time (HKT)" },
  { value: "Australia/Perth", label: "UTC+08:00 Australian Western Standard Time (AWST)" },
  { value: "Asia/Tokyo", label: "UTC+09:00 Japan Standard Time (JST)" },
  { value: "Asia/Seoul", label: "UTC+09:00 Korea Standard Time (KST)" },
  { value: "Australia/Adelaide", label: "UTC+09:30 Australian Central Standard Time (ACST)" },
  { value: "Australia/Sydney", label: "UTC+10:00 Australian Eastern Standard Time (AEST)" },
  { value: "Pacific/Guam", label: "UTC+10:00 Chamorro Standard Time (ChST)" },
  { value: "Pacific/Noumea", label: "UTC+11:00 New Caledonia Time (NCT)" },
  { value: "Pacific/Auckland", label: "UTC+12:00 New Zealand Standard Time (NZST)" },
  { value: "Pacific/Fiji", label: "UTC+12:00 Fiji Standard Time (FJT)" },
  { value: "Pacific/Tongatapu", label: "UTC+13:00 Tonga Standard Time (TOT)" },
  { value: "Pacific/Kiritimati", label: "UTC+14:00 Line Islands Time (LINT)" },
];

/**
 * Map each country to its applicable timezone IANA values.
 * When a country is selected, only these timezones should appear.
 */
export const countryTimezones: Record<string, string[]> = {
  // Africa
  "Algeria": ["Africa/Lagos"], "Angola": ["Africa/Lagos"], "Benin": ["Africa/Lagos"],
  "Botswana": ["Africa/Johannesburg"], "Burkina Faso": ["UTC"],
  "Burundi": ["Africa/Johannesburg"], "Cabo Verde": ["Atlantic/Azores"],
  "Cameroon": ["Africa/Lagos"], "Central African Republic": ["Africa/Lagos"],
  "Chad": ["Africa/Lagos"], "Comoros": ["Africa/Nairobi"],
  "Congo": ["Africa/Lagos"], "Côte d'Ivoire": ["UTC"],
  "DR Congo": ["Africa/Lagos", "Africa/Johannesburg"],
  "Djibouti": ["Africa/Nairobi"], "Egypt": ["Africa/Cairo"],
  "Equatorial Guinea": ["Africa/Lagos"], "Eritrea": ["Africa/Nairobi"],
  "Eswatini": ["Africa/Johannesburg"], "Ethiopia": ["Africa/Nairobi"],
  "Gabon": ["Africa/Lagos"], "Gambia": ["UTC"],
  "Ghana": ["UTC"], "Guinea": ["UTC"], "Guinea-Bissau": ["UTC"],
  "Kenya": ["Africa/Nairobi"], "Lesotho": ["Africa/Johannesburg"],
  "Liberia": ["UTC"], "Libya": ["Africa/Cairo"],
  "Madagascar": ["Africa/Nairobi"], "Malawi": ["Africa/Johannesburg"],
  "Mali": ["UTC"], "Mauritania": ["UTC"],
  "Mauritius": ["Asia/Dubai"], "Morocco": ["Europe/London", "Africa/Lagos"],
  "Mozambique": ["Africa/Johannesburg"], "Namibia": ["Africa/Johannesburg"],
  "Niger": ["Africa/Lagos"], "Nigeria": ["Africa/Lagos"],
  "Rwanda": ["Africa/Johannesburg"],
  "São Tomé and Príncipe": ["UTC"],
  "Senegal": ["UTC"], "Seychelles": ["Asia/Dubai"],
  "Sierra Leone": ["UTC"], "Somalia": ["Africa/Nairobi"],
  "South Africa": ["Africa/Johannesburg"], "South Sudan": ["Africa/Nairobi"],
  "Sudan": ["Africa/Johannesburg"], "Tanzania": ["Africa/Nairobi"],
  "Togo": ["UTC"], "Tunisia": ["Africa/Lagos"],
  "Uganda": ["Africa/Nairobi"], "Zambia": ["Africa/Johannesburg"],
  "Zimbabwe": ["Africa/Johannesburg"],
  // Asia
  "Afghanistan": ["Asia/Kabul"], "Bangladesh": ["Asia/Dhaka"],
  "Bhutan": ["Asia/Dhaka"], "Brunei": ["Asia/Singapore"],
  "Cambodia": ["Asia/Bangkok"], "China": ["Asia/Shanghai"],
  "India": ["Asia/Kolkata"], "Indonesia": ["Asia/Jakarta", "Asia/Singapore"],
  "Japan": ["Asia/Tokyo"], "Kazakhstan": ["Asia/Almaty"],
  "Kyrgyzstan": ["Asia/Almaty"], "Laos": ["Asia/Bangkok"],
  "Malaysia": ["Asia/Singapore"], "Maldives": ["Asia/Karachi"],
  "Mongolia": ["Asia/Shanghai"], "Myanmar": ["Asia/Yangon"],
  "Nepal": ["Asia/Kathmandu"], "North Korea": ["Asia/Seoul"],
  "Pakistan": ["Asia/Karachi"], "Philippines": ["Asia/Singapore"],
  "Singapore": ["Asia/Singapore"], "South Korea": ["Asia/Seoul"],
  "Sri Lanka": ["Asia/Kolkata"], "Taiwan": ["Asia/Shanghai"],
  "Tajikistan": ["Asia/Tashkent"], "Thailand": ["Asia/Bangkok"],
  "Timor-Leste": ["Asia/Tokyo"], "Turkmenistan": ["Asia/Tashkent"],
  "Uzbekistan": ["Asia/Tashkent"], "Vietnam": ["Asia/Bangkok"],
  // Europe
  "Albania": ["Europe/Paris"], "Andorra": ["Europe/Paris"],
  "Armenia": ["Asia/Dubai"], "Austria": ["Europe/Paris"],
  "Azerbaijan": ["Asia/Dubai"], "Belarus": ["Europe/Moscow"],
  "Belgium": ["Europe/Paris"], "Bosnia and Herzegovina": ["Europe/Paris"],
  "Bulgaria": ["Europe/Helsinki"], "Croatia": ["Europe/Paris"],
  "Cyprus": ["Europe/Helsinki"], "Czech Republic": ["Europe/Paris"],
  "Denmark": ["Europe/Paris"], "Estonia": ["Europe/Helsinki"],
  "Finland": ["Europe/Helsinki"], "France": ["Europe/Paris"],
  "Georgia": ["Asia/Dubai"], "Germany": ["Europe/Berlin"],
  "Greece": ["Europe/Helsinki"], "Hungary": ["Europe/Paris"],
  "Iceland": ["UTC"], "Ireland": ["Europe/London"],
  "Italy": ["Europe/Paris"], "Kosovo": ["Europe/Paris"],
  "Latvia": ["Europe/Helsinki"], "Liechtenstein": ["Europe/Paris"],
  "Lithuania": ["Europe/Helsinki"], "Luxembourg": ["Europe/Paris"],
  "Malta": ["Europe/Paris"], "Moldova": ["Europe/Helsinki"],
  "Monaco": ["Europe/Paris"], "Montenegro": ["Europe/Paris"],
  "Netherlands": ["Europe/Paris"], "North Macedonia": ["Europe/Paris"],
  "Norway": ["Europe/Paris"], "Poland": ["Europe/Paris"],
  "Portugal": ["Europe/London", "Atlantic/Azores"],
  "Romania": ["Europe/Helsinki"], "Russia": ["Europe/Moscow", "Asia/Dubai", "Asia/Tashkent", "Asia/Almaty", "Asia/Bangkok", "Asia/Shanghai", "Asia/Tokyo"],
  "San Marino": ["Europe/Paris"], "Serbia": ["Europe/Paris"],
  "Slovakia": ["Europe/Paris"], "Slovenia": ["Europe/Paris"],
  "Spain": ["Europe/Paris"], "Sweden": ["Europe/Paris"],
  "Switzerland": ["Europe/Paris"], "Turkey": ["Europe/Istanbul"],
  "UK": ["Europe/London"], "Ukraine": ["Europe/Helsinki"],
  "Vatican City": ["Europe/Paris"],
  // Middle East
  "Bahrain": ["Asia/Riyadh"], "Iran": ["Asia/Tehran"],
  "Iraq": ["Asia/Riyadh"], "Israel": ["Europe/Helsinki"],
  "Jordan": ["Asia/Riyadh"], "Kuwait": ["Asia/Riyadh"],
  "Lebanon": ["Europe/Helsinki"], "Oman": ["Asia/Dubai"],
  "Palestine": ["Europe/Helsinki"], "Qatar": ["Asia/Riyadh"],
  "Saudi Arabia": ["Asia/Riyadh"], "Syria": ["Asia/Riyadh"],
  "UAE": ["Asia/Dubai"], "Yemen": ["Asia/Riyadh"],
  // North America
  "Antigua and Barbuda": ["America/Halifax"], "Bahamas": ["America/New_York"],
  "Barbados": ["America/Halifax"], "Belize": ["America/Chicago"],
  "Canada": ["America/St_Johns", "America/Halifax", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles"],
  "Costa Rica": ["America/Chicago"], "Cuba": ["America/New_York"],
  "Dominica": ["America/Halifax"], "Dominican Republic": ["America/Halifax"],
  "El Salvador": ["America/Chicago"], "Grenada": ["America/Halifax"],
  "Guatemala": ["America/Chicago"], "Haiti": ["America/New_York"],
  "Honduras": ["America/Chicago"], "Jamaica": ["America/New_York"],
  "Mexico": ["America/Chicago", "America/Denver", "America/Los_Angeles"],
  "Nicaragua": ["America/Chicago"], "Panama": ["America/New_York"],
  "Saint Kitts and Nevis": ["America/Halifax"],
  "Saint Lucia": ["America/Halifax"],
  "Saint Vincent and the Grenadines": ["America/Halifax"],
  "Trinidad and Tobago": ["America/Halifax"],
  "USA": ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu"],
  // Oceania
  "Australia": ["Australia/Perth", "Australia/Adelaide", "Australia/Sydney"],
  "Fiji": ["Pacific/Fiji"], "Kiribati": ["Pacific/Kiritimati"],
  "Marshall Islands": ["Pacific/Auckland"], "Micronesia": ["Pacific/Guam"],
  "Nauru": ["Pacific/Auckland"], "New Zealand": ["Pacific/Auckland"],
  "Palau": ["Asia/Tokyo"], "Papua New Guinea": ["Pacific/Guam"],
  "Samoa": ["Pacific/Midway"], "Solomon Islands": ["Pacific/Noumea"],
  "Tonga": ["Pacific/Tongatapu"], "Tuvalu": ["Pacific/Auckland"],
  "Vanuatu": ["Pacific/Noumea"],
  // South America
  "Argentina": ["America/Argentina/Buenos_Aires"],
  "Bolivia": ["America/Halifax"], "Brazil": ["America/Sao_Paulo", "America/Halifax"],
  "Chile": ["America/Halifax"], "Colombia": ["America/New_York"],
  "Ecuador": ["America/New_York"], "Guyana": ["America/Halifax"],
  "Paraguay": ["America/Halifax"], "Peru": ["America/New_York"],
  "Suriname": ["America/Sao_Paulo"], "Uruguay": ["America/Sao_Paulo"],
  "Venezuela": ["America/Caracas"],
};

/**
 * Get filtered timezones for a given country.
 * If no country selected, returns full list.
 */
export function getTimezonesForCountry(country: string): typeof TIMEZONE_LIST {
  const tzValues = countryTimezones[country];
  if (!tzValues || tzValues.length === 0) return TIMEZONE_LIST;
  return TIMEZONE_LIST.filter(tz => tzValues.includes(tz.value));
}

/**
 * Get countries for a given region.
 */
export function getCountriesForRegion(region: string): string[] {
  return countries.filter(c => countryToRegion[c] === region);
}

/**
 * Normalize a country name to its canonical form.
 */
export function normalizeCountryName(country: string | null | undefined): string | null {
  if (!country) return null;
  const trimmed = country.trim();
  if (!trimmed) return null;

  const exactMatch = countries.find(c => c.toLowerCase() === trimmed.toLowerCase());
  if (exactMatch) return exactMatch;

  const alias = countryAliases[trimmed.toLowerCase()];
  if (alias) return alias;

  return trimmed;
}

/**
 * Get the region for a given country name.
 */
export function getRegionForCountry(country: string | null | undefined): string | null {
  const normalized = normalizeCountryName(country);
  if (!normalized) return null;
  return countryToRegion[normalized] || null;
}
