CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS USERS;
CREATE SCHEMA IF NOT EXISTS SUBSCRIPTION;
CREATE SCHEMA IF NOT EXISTS FILES;


DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
        CREATE TYPE ROLE AS ENUM ('COMPANY', 'EMPLOYEE');
    END IF;
END$$;


CREATE TABLE IF NOT EXISTS COUNTRIES(
    id VARCHAR(2) PRIMARY KEY CHECK(LENGTH(id) = 2) NOT NULL,
    name VARCHAR(64) CHECK(LENGTH(name) > 2) NOT NULL,
    UNIQUE(ID)
);

CREATE TABLE IF NOT EXISTS INDUSTRIES(
    id VARCHAR(8) PRIMARY KEY CHECK(LENGTH(id) > 1) NOT NULL,
    name VARCHAR(64) NOT NULL CHECK(LENGTH(name) > 2) NOT NULL,
    UNIQUE(ID)
);


CREATE TABLE IF NOT EXISTS users.user(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    email VARCHAR(255) UNIQUE CHECK(EMAIL ~ '^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$') NOT NULL,
    role ROLE NOT NULL,
    registration_date DATE,
    hash VARCHAR(64) NOT NULL CHECK(LENGTH(hash) = 64),
    salt VARCHAR(64) NOT NULL CHECK(LENGTH(salt) = 64)
);


CREATE TABLE IF NOT EXISTS subscription.tier(
    id SERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(64) NOT NULL,
    file_limit INTEGER CHECK((file_limit > 0)),
    user_limit INTEGER CHECK((user_limit > 0)),
    price money NOT NULL CHECK(price >= '$0'),
    file_price money CHECK(file_price >= '$0'),
    user_price money CHECK(user_price >= '$0'),
    UNIQUE(name)
);

CREATE TABLE IF NOT EXISTS users.company(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    user_id UUID REFERENCES users.user(id) ON DELETE CASCADE NOT NULL,
    company_name VARCHAR(64) UNIQUE CHECK(company_name ~ '^(?!\s)(?!.*\s$)(?=.*[a-zA-Z0-9])[a-zA-Z0-9 ''~?!]{2,}$') NOT NULL,
    industry VARCHAR(8) REFERENCES industries(id) ON DELETE  SET DEFAULT DEFAULT 'ELSE' NOT NULL,
    country VARCHAR(2) REFERENCES countries(id) ON DELETE RESTRICT NOT NULL
);

CREATE TABLE IF NOT EXISTS users.employee(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    user_id UUID REFERENCES users.user(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES users.company(id) ON DELETE CASCADE NOT NULL
);


CREATE TABLE IF NOT EXISTS subscription.record(
    id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES users.company(id) ON DELETE RESTRICT NOT NULL,
    tier_id INTEGER REFERENCES subscription.tier(id) ON DELETE CASCADE NOT NULL,
    tier_start DATE DEFAULT NOW() NOT NULL,
    tier_end DATE GENERATED ALWAYS AS (tier_start + INTERVAL '1 month') STORED NOT NULL,
    billed_at DATE,
    user_count INTEGER DEFAULT 0 NOT NULL CHECK(user_count >=0),
    files_uploaded INTEGER DEFAULT 0 NOT NULL CHECK(files_uploaded >= 0)
);

ALTER TABLE USERS.COMPANY ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscription.record(id) ON DELETE RESTRICT;


CREATE TABLE IF NOT EXISTS files.file (
    id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    owner_company_id UUID REFERENCES users.company(id) ON DELETE CASCADE NOT NULL,
    owner_user_id UUID REFERENCES users.user(id) ON DELETE CASCDE NOT NULL,
    name VARCHAR(64) NOT NULL,
);

CREATE TABLE IF NOT EXISTS files.access (
    id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    file_id UUID REFERENCES files.file(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users.user(id) ON DELETE CASCADE NOT NULL
);

CREATE OR REPLACE FUNCTION check_unique_user_file()
RETURNS TRIGGER AS $$
BEGIN

  IF NEW.name !~ '^[0-9a-zA-Z_\-. ]+$' THEN
    RAISE EXCEPTION 'Invalid file name: %', NEW.name;
  END IF;

  -- Check for existing file with the same name and owner_user_id
  IF EXISTS (
    SELECT 1
    FROM files.file
    WHERE owner_user_id = NEW.owner_user_id
    AND name = NEW.name
  )
  THEN
    -- Just pass without inserting or updating
    RETURN NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_check_unique_user_file
BEFORE INSERT OR UPDATE ON files.file
FOR EACH ROW EXECUTE FUNCTION check_unique_user_file();



CREATE OR REPLACE FUNCTION prevent_duplicate_access()
RETURNS TRIGGER AS
$$
BEGIN
    -- Check if the row exists
    IF EXISTS (
        SELECT 1 
        FROM files.access 
        WHERE file_id = NEW.file_id AND user_id = NEW.user_id
    ) 
    THEN 
        -- If it exists, do nothing
        RETURN NULL;
    ELSE 
        -- If it does not exist, allow the insert/update
        RETURN NEW;
    END IF;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER check_duplicate_access
BEFORE INSERT OR UPDATE ON files.access
FOR EACH ROW EXECUTE FUNCTION prevent_duplicate_access();


INSERT INTO COUNTRIES ("id", "name") VALUES (E'AF', E'Afghanistan');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'AX', E'Åland Islands');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'AL', E'Albania');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'DZ', E'Algeria');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'AS', E'American Samoa');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'AD', E'Andorra');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'AO', E'Angola');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'AI', E'Anguilla');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'AQ', E'Antarctica');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'AG', E'Antigua & Barbuda');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'AR', E'Argentina');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'AM', E'Armenia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'AW', E'Aruba');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'AU', E'Australia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'AT', E'Austria');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'AZ', E'Azerbaijan');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'BS', E'Bahamas');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'BH', E'Bahrain');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'BD', E'Bangladesh');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'BB', E'Barbados');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'BY', E'Belarus');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'BE', E'Belgium');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'BZ', E'Belize');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'BJ', E'Benin');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'BM', E'Bermuda');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'BT', E'Bhutan');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'BO', E'Bolivia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'BA', E'Bosnia & Herzegovina');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'BW', E'Botswana');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'BV', E'Bouvet Island');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'BR', E'Brazil');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'IO', E'British Indian Ocean Territory');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'VG', E'British Virgin Islands');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'BN', E'Brunei');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'BG', E'Bulgaria');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'BF', E'Burkina Faso');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'BI', E'Burundi');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'KH', E'Cambodia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'CM', E'Cameroon');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'CA', E'Canada');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'CV', E'Cape Verde');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'BQ', E'Caribbean Netherlands');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'KY', E'Cayman Islands');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'CF', E'Central African Republic');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'TD', E'Chad');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'CL', E'Chile');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'CN', E'China');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'CX', E'Christmas Island');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'CC', E'Cocos (Keeling) Islands');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'CO', E'Colombia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'KM', E'Comoros');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'CG', E'Congo - Brazzaville');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'CD', E'Congo - Kinshasa');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'CK', E'Cook Islands');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'CR', E'Costa Rica');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'CI', E'Côte d’Ivoire');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'HR', E'Croatia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'CU', E'Cuba');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'CW', E'Curaçao');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'CY', E'Cyprus');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'CZ', E'Czechia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'DK', E'Denmark');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'DJ', E'Djibouti');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'DM', E'Dominica');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'DO', E'Dominican Republic');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'EC', E'Ecuador');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'EG', E'Egypt');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'SV', E'El Salvador');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'GQ', E'Equatorial Guinea');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'ER', E'Eritrea');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'EE', E'Estonia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'SZ', E'Eswatini');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'ET', E'Ethiopia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'FK', E'Falkland Islands');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'FO', E'Faroe Islands');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'FJ', E'Fiji');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'FI', E'Finland');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'FR', E'France');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'GF', E'French Guiana');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'PF', E'French Polynesia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'TF', E'French Southern Territories');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'GA', E'Gabon');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'GM', E'Gambia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'GE', E'Georgia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'DE', E'Germany');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'GH', E'Ghana');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'GI', E'Gibraltar');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'GR', E'Greece');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'GL', E'Greenland');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'GD', E'Grenada');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'GP', E'Guadeloupe');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'GU', E'Guam');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'GT', E'Guatemala');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'GG', E'Guernsey');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'GN', E'Guinea');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'GW', E'Guinea-Bissau');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'GY', E'Guyana');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'HT', E'Haiti');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'HM', E'Heard & McDonald Islands');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'HN', E'Honduras');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'HK', E'Hong Kong SAR China');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'HU', E'Hungary');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'IS', E'Iceland');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'IN', E'India');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'ID', E'Indonesia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'IR', E'Iran');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'IQ', E'Iraq');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'IE', E'Ireland');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'IM', E'Isle of Man');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'IL', E'Israel');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'IT', E'Italy');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'JM', E'Jamaica');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'JP', E'Japan');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'JE', E'Jersey');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'JO', E'Jordan');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'KZ', E'Kazakhstan');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'KE', E'Kenya');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'KI', E'Kiribati');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'KW', E'Kuwait');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'KG', E'Kyrgyzstan');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'LA', E'Laos');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'LV', E'Latvia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'LB', E'Lebanon');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'LS', E'Lesotho');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'LR', E'Liberia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'LY', E'Libya');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'LI', E'Liechtenstein');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'LT', E'Lithuania');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'LU', E'Luxembourg');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'MO', E'Macao SAR China');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'MG', E'Madagascar');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'MW', E'Malawi');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'MY', E'Malaysia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'MV', E'Maldives');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'ML', E'Mali');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'MT', E'Malta');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'MH', E'Marshall Islands');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'MQ', E'Martinique');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'MR', E'Mauritania');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'MU', E'Mauritius');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'YT', E'Mayotte');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'MX', E'Mexico');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'FM', E'Micronesia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'MD', E'Moldova');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'MC', E'Monaco');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'MN', E'Mongolia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'ME', E'Montenegro');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'MS', E'Montserrat');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'MA', E'Morocco');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'MZ', E'Mozambique');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'MM', E'Myanmar (Burma)');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'NA', E'Namibia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'NR', E'Nauru');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'NP', E'Nepal');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'NL', E'Netherlands');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'NC', E'New Caledonia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'NZ', E'New Zealand');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'NI', E'Nicaragua');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'NE', E'Niger');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'NG', E'Nigeria');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'NU', E'Niue');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'NF', E'Norfolk Island');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'KP', E'North Korea');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'MK', E'North Macedonia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'MP', E'Northern Mariana Islands');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'NO', E'Norway');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'OM', E'Oman');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'PK', E'Pakistan');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'PW', E'Palau');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'PS', E'Palestinian Territories');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'PA', E'Panama');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'PG', E'Papua New Guinea');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'PY', E'Paraguay');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'PE', E'Peru');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'PH', E'Philippines');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'PN', E'Pitcairn Islands');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'PL', E'Poland');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'PT', E'Portugal');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'PR', E'Puerto Rico');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'QA', E'Qatar');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'RE', E'Réunion');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'RO', E'Romania');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'RU', E'Russia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'RW', E'Rwanda');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'WS', E'Samoa');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'SM', E'San Marino');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'ST', E'São Tomé & Príncipe');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'SA', E'Saudi Arabia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'SN', E'Senegal');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'RS', E'Serbia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'SC', E'Seychelles');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'SL', E'Sierra Leone');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'SG', E'Singapore');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'SX', E'Sint Maarten');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'SK', E'Slovakia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'SI', E'Slovenia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'SB', E'Solomon Islands');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'SO', E'Somalia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'ZA', E'South Africa');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'GS', E'South Georgia & South Sandwich Islands');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'KR', E'South Korea');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'SS', E'South Sudan');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'ES', E'Spain');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'LK', E'Sri Lanka');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'BL', E'St. Barthélemy');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'SH', E'St. Helena');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'KN', E'St. Kitts & Nevis');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'LC', E'St. Lucia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'MF', E'St. Martin');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'PM', E'St. Pierre & Miquelon');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'VC', E'St. Vincent & Grenadines');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'SD', E'Sudan');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'SR', E'Suriname');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'SJ', E'Svalbard & Jan Mayen');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'SE', E'Sweden');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'CH', E'Switzerland');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'SY', E'Syria');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'TW', E'Taiwan');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'TJ', E'Tajikistan');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'TZ', E'Tanzania');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'TH', E'Thailand');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'TL', E'Timor-Leste');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'TG', E'Togo');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'TK', E'Tokelau');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'TO', E'Tonga');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'TT', E'Trinidad & Tobago');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'TN', E'Tunisia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'TR', E'Turkey');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'TM', E'Turkmenistan');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'TC', E'Turks & Caicos Islands');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'TV', E'Tuvalu');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'UM', E'U.S. Outlying Islands');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'VI', E'U.S. Virgin Islands');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'UG', E'Uganda');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'UA', E'Ukraine');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'AE', E'United Arab Emirates');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'GB', E'United Kingdom');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'US', E'United States');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'UY', E'Uruguay');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'UZ', E'Uzbekistan');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'VU', E'Vanuatu');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'VA', E'Vatican City');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'VE', E'Venezuela');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'VN', E'Vietnam');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'WF', E'Wallis & Futuna');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'EH', E'Western Sahara');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'YE', E'Yemen');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'ZM', E'Zambia');
INSERT INTO COUNTRIES ("id", "name") VALUES (E'ZW', E'Zimbabwe');

INSERT INTO INDUSTRIES(id, name) VALUES('FIN', 'Finances');
INSERT INTO INDUSTRIES(id, name) VALUES('ECOM', 'E-Commerce');
INSERT INTO INDUSTRIES(id, name) VALUES('MED', 'Medicine');
INSERT INTO INDUSTRIES(id, name) VALUES('TECH', 'Technology');
INSERT INTO INDUSTRIES(id, name) VALUES('AUTO', 'Automotive');
INSERT INTO INDUSTRIES(id, name) VALUES('EDU', 'Education');
INSERT INTO INDUSTRIES(id, name) VALUES('CONS', 'Consulting');
INSERT INTO INDUSTRIES(id, name) VALUES('RE', 'Real Estate');
INSERT INTO INDUSTRIES(id, name) VALUES('FOOD', 'Food and Beverage');
INSERT INTO INDUSTRIES(id, name) VALUES('TRAV', 'Travel and Tourism');
INSERT INTO INDUSTRIES(id, name) VALUES('MANU', 'Manufacturing');
INSERT INTO INDUSTRIES(id, name) VALUES('MEDIA', 'Media and Entertainment');
INSERT INTO INDUSTRIES(id, name) VALUES('PHARMA', 'Pharmaceuticals');
INSERT INTO INDUSTRIES(id, name) VALUES('ENERGY', 'Energy');
INSERT INTO INDUSTRIES(id, name) VALUES('AGR', 'Agriculture');
INSERT INTO INDUSTRIES(id, name) VALUES('APP', 'Apparel and Fashion');
INSERT INTO INDUSTRIES(id, name) VALUES('ENV', 'Environmental Services');
INSERT INTO INDUSTRIES(id, name) VALUES('TELECOM', 'Telecommunications');
INSERT INTO INDUSTRIES(id, name) VALUES('TRANS', 'Transportation');
INSERT INTO INDUSTRIES(id, name) VALUES('FINTECH', 'Financial Technology');
INSERT INTO INDUSTRIES(id, name) VALUES('HR', 'Human Resources');
INSERT INTO INDUSTRIES(id, name) VALUES('INSUR', 'Insurance');
INSERT INTO INDUSTRIES(id, name) VALUES('ART', 'Art and Culture');
INSERT INTO INDUSTRIES(id, name) VALUES('NGO', 'Non-Profit');
INSERT INTO INDUSTRIES(id, name) VALUES('GOV', 'Government');
INSERT INTO INDUSTRIES(id, name) VALUES('LOG', 'Logistics');
INSERT INTO INDUSTRIES(id, name) VALUES('DIGI', 'Digital Services');
INSERT INTO INDUSTRIES(id, name) VALUES('RETAIL', 'Retail');
INSERT INTO INDUSTRIES(id, name) VALUES('LEGAL', 'Legal Services');
INSERT INTO INDUSTRIES(id, name) VALUES('CRYPTO', 'Cryptocurrency');
INSERT INTO INDUSTRIES(id, name) VALUES('WELL', 'Wellness and Health');
INSERT INTO INDUSTRIES(id, name) VALUES('SEC', 'Security and Defense');
INSERT INTO INDUSTRIES(id, name) VALUES('GAM', 'Gaming');
INSERT INTO INDUSTRIES(id, name) VALUES('SUST', 'Sustainability');
INSERT INTO INDUSTRIES(id, name) VALUES('DATA', 'Data and Analytics');
INSERT INTO INDUSTRIES(id, name) VALUES('ELSE', 'else');

INSERT INTO subscription.tier(price, name, file_limit, user_limit, file_price, user_price) VALUES('$0.00', 'FREE', 10, 1, NULL, NULL);
INSERT INTO subscription.tier(price, name, file_limit, user_limit, file_price, user_price) VALUES('$0.00', 'BASIC', 100, 10, null, '$5.00');
INSERT INTO subscription.tier(price, name, file_limit, user_limit, file_price, user_price) VALUES('$300.00','PREMIUM', 1000, null, '$0.50', null);