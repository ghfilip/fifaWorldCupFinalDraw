import { Client } from 'pg';

const client = new Client();
client.connect();

export async function updateValue(id, value) {
  const row = await client.query(`Update input_data SET name = '${value}' WHERE id = '${id}';`);
  return row || null;
}

async function getDataForPot(pot) {
  const row = await client.query(`SELECT * FROM input_data WHERE pot = ${pot} ORDER BY iid ASC;`);
  return row.rows || null;
}

async function getRandomDataForPot(pot) {
  const row = await client.query(`SELECT * FROM input_data WHERE pot = ${pot} ORDER BY random();`);
  return row.rows || null;
}

async function getPotsNumber() {
  const pots = await client.query('SELECT pot FROM input_data GROUP BY pot ORDER BY pot ASC;');
  return pots.rows || null;
}

export async function deleteEntry(id) {
  const del = await client.query(`DELETE FROM input_data WHERE id = '${id}';`);
  return !!del.rowCount;
}

export async function getFDData() {
  const pots = await getPotsNumber();

  let queryInt = [];
  let qInt = [];

  for (let i of pots) {
    qInt.push(` b_${i.pot}.name as b_${i.pot}_name `);
    queryInt.push(` LEFT JOIN input_data b_${i.pot} ON (a.pot_${i.pot}_id::text = b_${i.pot}.id::text) `);
  }
  const query = `SELECT ${qInt.join(', ')} FROM final_draw a ${queryInt.join(' ')};`;
  const fd = await client.query(query);

  return fd.rows || null;
}

export async function isFD() {
  const exists = await client.query('SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = \'final_draw\');');

  return !!exists.rows.exists;
}

export async function getData() {
  const pots = await getPotsNumber();

  const ret = {};
  for (let i of pots) {
    const row = await getDataForPot(i.pot);

    if (row.length) {
      ret[`Pot ${i.pot}`] = row;
    }
  }

  return ret || null;
}

export async function finalDraw() {
  const pots = await getPotsNumber();

  const ret = {};
  for (let i of pots) {
    const row = await getRandomDataForPot(i.pot);

    if (row.length) {
      ret[i.pot] = row;
    }
  }

  await dropTable('final_draw');
  await createFDTable();

  const maxTeamsInPot = await countMaxPot();

  for (let i = 0; i < maxTeamsInPot; i++) {
    const fd = [];

    for (let k of pots) {
      if (ret[k.pot][i]) {
        fd.push(`'${ret[k.pot][i].id}'`);
      } else {
        fd.push(`''`);
      }
    }

    await populateFDTable(fd);
  }

  const finalData = await getFDData();

  return finalData || null;
}

async function countMaxPot() {
  const max = await client.query('SELECT count(id) as maxx FROM input_data GROUP BY pot order by maxx desc limit 1;');
  return max.rows[0].maxx || 0;
}

export async function dropTable(table) {
  return client.query(`DROP TABLE IF EXISTS ${table};`);
}

async function createFDTable() {
  const pots = await getPotsNumber();

  let queryInt = '';

  for (let i of pots) {
    queryInt += `, pot_${i.pot}_id varchar NOT NULL`;
  }

  return client.query(`CREATE TABLE final_draw (id uuid primary key ${queryInt} );`);
}

async function populateFDTable(values) {
  const pots = await getPotsNumber();

  let queryInt = [];

  for (let i of pots) {
    queryInt.push(`pot_${i.pot}_id`);
  }

  const query = `INSERT INTO final_draw (id, ${queryInt.join(',')}) values (uuid_generate_v4(), ${values.join(',')});`;

  return client.query(query);
}

export async function insertData(data) {
  await client.query(`INSERT INTO input_data (id, iid, name, pot) values (uuid_generate_v4(), '${data.id}', '${data.name}', ${data.id[0]})`);
}

export async function truncateTable(table) {
  await client.query(`TRUNCATE ${table};`);
}


export const isoCountries = {
  'Afghanistan': 'AF',
  'Aland Islands': 'AX',
  'Albania': 'AL',
  'Algeria': 'DZ',
  'American Samoa': 'AS',
  'Andorra': 'AD',
  'Angola': 'AO',
  'Anguilla': 'AI',
  'Antarctica': 'AQ',
  'Antigua And Barbuda': 'AG',
  'Argentina': 'AR',
  'Armenia': 'AM',
  'Aruba': 'AW',
  'Australia': 'AU',
  'Austria': 'AT',
  'Azerbaijan': 'AZ',
  'Bahamas': 'BS',
  'Bahrain': 'BH',
  'Bangladesh': 'BD',
  'Barbados': 'BB',
  'Belarus': 'BY',
  'Belgium': 'BE',
  'Belize': 'BZ',
  'Benin': 'BJ',
  'Bermuda': 'BM',
  'Bhutan': 'BT',
  'Bolivia': 'BO',
  'Bosnia And Herzegovina': 'BA',
  'Botswana': 'BW',
  'Bouvet Island': 'BV',
  'Brazil': 'BR',
  'British Indian Ocean Territory': 'IO',
  'Brunei Darussalam': 'BN',
  'Bulgaria': 'BG',
  'Burkina Faso': 'BF',
  'Burundi': 'BI',
  'Cambodia': 'KH',
  'Cameroon': 'CM',
  'Canada': 'CA',
  'Cape Verde': 'CV',
  'Cayman Islands': 'KY',
  'Central African Republic': 'CF',
  'Chad': 'TD',
  'Chile': 'CL',
  'China': 'CN',
  'Christmas Island': 'CX',
  'Cocos (Keeling) Islands': 'CC',
  'Colombia': 'CO',
  'Comoros': 'KM',
  'Congo': 'CG',
  'Congo, Democratic Republic': 'CD',
  'Cook Islands': 'CK',
  'Costa Rica': 'CR',
  'Cote D\'Ivoire': 'CI',
  'Croatia': 'HR',
  'Cuba': 'CU',
  'Cyprus': 'CY',
  'Czech Republic': 'CZ',
  'Denmark': 'DK',
  'Djibouti': 'DJ',
  'Dominica': 'DM',
  'Dominican Republic': 'DO',
  'Ecuador': 'EC',
  'Egypt': 'EG',
  'El Salvador': 'SV',
  'Equatorial Guinea': 'GQ',
  'Eritrea': 'ER',
  'Estonia': 'EE',
  'Ethiopia': 'ET',
  'Falkland Islands': 'FK',
  'Faroe Islands': 'FO',
  'Fiji': 'FJ',
  'Finland': 'FI',
  'France': 'FR',
  'French Guiana': 'GF',
  'French Polynesia': 'PF',
  'French Southern Territories': 'TF',
  'Gabon': 'GA',
  'Gambia': 'GM',
  'Georgia': 'GE',
  'Germany': 'DE',
  'Ghana': 'GH',
  'Gibraltar': 'GI',
  'Greece': 'GR',
  'Greenland': 'GL',
  'Grenada': 'GD',
  'Guadeloupe': 'GP',
  'Guam': 'GU',
  'Guatemala': 'GT',
  'Guernsey': 'GG',
  'Guinea': 'GN',
  'Guinea-Bissau': 'GW',
  'Guyana': 'GY',
  'Haiti': 'HT',
  'Heard Island & Mcdonald Islands': 'HM',
  'Holy See (Vatican City State)': 'VA',
  'Honduras': 'HN',
  'Hong Kong': 'HK',
  'Hungary': 'HU',
  'Iceland': 'IS',
  'India': 'IN',
  'Indonesia': 'ID',
  'Iran, Islamic Republic Of': 'IR',
  'Iran': 'IR',
  'Iraq': 'IQ',
  'Ireland': 'IE',
  'Isle Of Man': 'IM',
  'Israel': 'IL',
  'Italy': 'IT',
  'Jamaica': 'JM',
  'Japan': 'JP',
  'Jersey': 'JE',
  'Jordan': 'JO',
  'Kazakhstan': 'KZ',
  'Kenya': 'KE',
  'Kiribati': 'KI',
  'Korea': 'KR',
  'South Korea': 'KR',
  'Kuwait': 'KW',
  'Kyrgyzstan': 'KG',
  'Lao People\'s Democratic Republic': 'LA',
  'Latvia': 'LV',
  'Lebanon': 'LB',
  'Lesotho': 'LS',
  'Liberia': 'LR',
  'Libyan Arab Jamahiriya': 'LY',
  'Liechtenstein': 'LI',
  'Lithuania': 'LT',
  'Luxembourg': 'LU',
  'Macao': 'MO',
  'Macedonia': 'MK',
  'Madagascar': 'MG',
  'Malawi': 'MW',
  'Malaysia': 'MY',
  'Maldives': 'MV',
  'Mali': 'ML',
  'Malta': 'MT',
  'Marshall Islands': 'MH',
  'Martinique': 'MQ',
  'Mauritania': 'MR',
  'Mauritius': 'MU',
  'Mayotte': 'YT',
  'Mexico': 'MX',
  'Micronesia, Federated States Of': 'FM',
  'Moldova': 'MD',
  'Monaco': 'MC',
  'Mongolia': 'MN',
  'Montenegro': 'ME',
  'Montserrat': 'MS',
  'Morocco': 'MA',
  'Mozambique': 'MZ',
  'Myanmar': 'MM',
  'Namibia': 'NA',
  'Nauru': 'NR',
  'Nepal': 'NP',
  'Netherlands': 'NL',
  'Netherlands Antilles': 'AN',
  'New Caledonia': 'NC',
  'New Zealand': 'NZ',
  'Nicaragua': 'NI',
  'Niger': 'NE',
  'Nigeria': 'NG',
  'Niue': 'NU',
  'Norfolk Island': 'NF',
  'Northern Mariana Islands': 'MP',
  'Norway': 'NO',
  'Oman': 'OM',
  'Pakistan': 'PK',
  'Palau': 'PW',
  'Palestinian Territory, Occupied': 'PS',
  'Panama': 'PA',
  'Papua New Guinea': 'PG',
  'Paraguay': 'PY',
  'Peru': 'PE',
  'Philippines': 'PH',
  'Pitcairn': 'PN',
  'Poland': 'PL',
  'Portugal': 'PT',
  'Puerto Rico': 'PR',
  'Qatar': 'QA',
  'Reunion': 'RE',
  'Romania': 'RO',
  'Russia': 'RU',
  'Rwanda': 'RW',
  'Saint Barthelemy': 'BL',
  'Saint Helena': 'SH',
  'Saint Kitts And Nevis': 'KN',
  'Saint Lucia': 'LC',
  'Saint Martin': 'MF',
  'Saint Pierre And Miquelon': 'PM',
  'Saint Vincent And Grenadines': 'VC',
  'Samoa': 'WS',
  'San Marino': 'SM',
  'Sao Tome And Principe': 'ST',
  'Saudi Arabia': 'SA',
  'Senegal': 'SN',
  'Serbia': 'RS',
  'Seychelles': 'SC',
  'Sierra Leone': 'SL',
  'Singapore': 'SG',
  'Slovakia': 'SK',
  'Slovenia': 'SI',
  'Solomon Islands': 'SB',
  'Somalia': 'SO',
  'South Africa': 'ZA',
  'South Georgia And Sandwich Isl.': 'GS',
  'Spain': 'ES',
  'Sri Lanka': 'LK',
  'Sudan': 'SD',
  'Suriname': 'SR',
  'Svalbard And Jan Mayen': 'SJ',
  'Swaziland': 'SZ',
  'Sweden': 'SE',
  'Switzerland': 'CH',
  'Syrian Arab Republic': 'SY',
  'Taiwan': 'TW',
  'Tajikistan': 'TJ',
  'Tanzania': 'TZ',
  'Thailand': 'TH',
  'Timor-Leste': 'TL',
  'Togo': 'TG',
  'Tokelau': 'TK',
  'Tonga': 'TO',
  'Trinidad And Tobago': 'TT',
  'Tunisia': 'TN',
  'Turkey': 'TR',
  'Turkmenistan': 'TM',
  'Turks And Caicos Islands': 'TC',
  'Tuvalu': 'TV',
  'Uganda': 'UG',
  'Ukraine': 'UA',
  'United Arab Emirates': 'AE',
  'United Kingdom': 'GB',
  'England': 'GB',
  'United States': 'US',
  'United States Outlying Islands': 'UM',
  'Uruguay': 'UY',
  'Uzbekistan': 'UZ',
  'Vanuatu': 'VU',
  'Venezuela': 'VE',
  'Vietnam': 'VN',
  'Virgin Islands, British': 'VG',
  'Virgin Islands, U.S.': 'VI',
  'Wallis And Futuna': 'WF',
  'Western Sahara': 'EH',
  'Yemen': 'YE',
  'Zambia': 'ZM',
  'Zimbabwe': 'ZW',
};
