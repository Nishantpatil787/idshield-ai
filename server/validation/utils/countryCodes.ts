/**
 * Standard ISO 3166-1 alpha-3 & ICAO Doc 9303 Machine Readable Travel Document Country Codes.
 * Includes official sovereign nations, autonomous territories, and ICAO special travel document codes.
 */
export const ICAO_COUNTRY_CODES = new Set<string>([
  // Sovereign States & Standard Territories (ISO 3166-1 alpha-3)
  'AFG', 'ALB', 'DZA', 'AND', 'AGO', 'ATG', 'ARG', 'ARM', 'AUS', 'AUT',
  'AZE', 'BHS', 'BHR', 'BGD', 'BRB', 'BLR', 'BEL', 'BLZ', 'BEN', 'BTN',
  'BOL', 'BIH', 'BWA', 'BRA', 'BRN', 'BGR', 'BFA', 'BDI', 'CPV', 'KHM',
  'CMR', 'CAN', 'CAF', 'TCD', 'CHL', 'CHN', 'COL', 'COM', 'COG', 'COD',
  'CRI', 'CIV', 'HRV', 'CUB', 'CYP', 'CZE', 'DNK', 'DJI', 'DMA', 'DOM',
  'ECU', 'EGY', 'SLV', 'GNQ', 'ERI', 'EST', 'SWZ', 'ETH', 'FJI', 'FIN',
  'FRA', 'GAB', 'GMB', 'GEO', 'DEU', 'GHA', 'GRC', 'GRD', 'GTM', 'GIN',
  'GNB', 'GUY', 'HTI', 'HND', 'HUN', 'ISL', 'IND', 'IDN', 'IRN', 'IRQ',
  'IRL', 'ISR', 'ITA', 'JAM', 'JPN', 'JOR', 'KAZ', 'KEN', 'KIR', 'PRK',
  'KOR', 'KWT', 'KGZ', 'LAO', 'LVA', 'LBN', 'LSO', 'LBR', 'LBY', 'LIE',
  'LTU', 'LUX', 'MDG', 'MWI', 'MYS', 'MDV', 'MLI', 'MLT', 'MHL', 'MRT',
  'MUS', 'MEX', 'FSM', 'MDA', 'MCO', 'MNG', 'MNE', 'MAR', 'MOZ', 'MMR',
  'NAM', 'NRU', 'NPL', 'NLD', 'NZL', 'NIC', 'NER', 'NGA', 'MKD', 'NOR',
  'OMN', 'PAK', 'PLW', 'PAN', 'PNG', 'PRY', 'PER', 'PHL', 'POL', 'PRT',
  'QAT', 'ROU', 'RUS', 'RWA', 'KNA', 'LCA', 'VCT', 'WSM', 'SMR', 'STP',
  'SAU', 'SEN', 'SRB', 'SYC', 'SLE', 'SGP', 'SVK', 'SVN', 'SLB', 'SOM',
  'ZAF', 'SSD', 'ESP', 'LKA', 'SDN', 'SUR', 'SWE', 'CHE', 'SYR', 'TJK',
  'TZA', 'THA', 'TLS', 'TGO', 'TON', 'TTO', 'TUN', 'TUR', 'TKM', 'TUV',
  'UGA', 'UKR', 'ARE', 'GBR', 'USA', 'URY', 'UZB', 'VUT', 'VAT', 'VEN',
  'VNM', 'YEM', 'ZMB', 'ZWE',

  // Dependent / Associated Territories with ICAO MRZ issuance
  'HKG', 'MAC', 'TWN', 'GRL', 'FRO', 'GIB', 'BMU', 'CYM', 'VGB', 'ABW',
  'CUW', 'SXM', 'PRI', 'GUM', 'MNP', 'VIR', 'ASM', 'NCL', 'PYF', 'WLF',

  // ICAO Doc 9303 Special Codes & Specimen Test Countries
  'UTO', // Utopia (ICAO standard reference specimen country)
  'UNA', // United Nations Agency / Official
  'UNK', // United Nations Interim Admin in Kosovo
  'XOM', // Sovereign Military Order of Malta
  'XXA', // Stateless person (1954 Convention)
  'XXB', // Refugee (1951 Convention)
  'XXC', // Refugee (Other)
  'XXX', // Unspecified nationality
  'D<<', // Germany diplomatic MRZ representation
]);

/**
 * Checks if a 3-letter string is a recognized ISO 3166-1 alpha-3 / ICAO 9303 country code.
 */
export function isValidCountryCode(code: string | null | undefined): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }
  const clean = code.trim().toUpperCase();
  return ICAO_COUNTRY_CODES.has(clean);
}

/**
 * Normalizes a country or nationality code or label into standard 3-letter ICAO format where possible.
 */
export function normalizeCountryCode(input: string | null | undefined): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }
  const clean = input.trim().toUpperCase();
  if (ICAO_COUNTRY_CODES.has(clean)) {
    return clean;
  }

  // Common country name to 3-letter mappings
  const NAME_TO_CODE: Record<string, string> = {
    'UNITED STATES': 'USA',
    'UNITED STATES OF AMERICA': 'USA',
    'GREAT BRITAIN': 'GBR',
    'UNITED KINGDOM': 'GBR',
    'CANADA': 'CAN',
    'FRANCE': 'FRA',
    'GERMANY': 'DEU',
    'INDIA': 'IND',
    'JAPAN': 'JPN',
    'AUSTRALIA': 'AUS',
    'ITALY': 'ITA',
    'SPAIN': 'ESP',
    'UTOPIA': 'UTO',
  };

  return NAME_TO_CODE[clean] || (clean.length === 3 ? clean : null);
}
