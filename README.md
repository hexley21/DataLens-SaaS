# DataLens-SaaS

## Database Design

### users.user

```sql
CREATE TABLE users.user(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    auth_id UUID REFERENCES users.auth(id) ON DELETE RESTRICT,
    email VARCHAR(255) CHECK(EMAIL ~ '^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{3,}))$') NOT NULL,
    role ROLE NOT NULL,
    registration_date DATE DEFAULT NOW() NOT NULL,
    is_active BOOLEAN DEFAULT FALSE NOT NULL,
    UNIQUE(email)
);
```

### users.auth

```sql
CREATE TABLE users.auth(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    hash VARCHAR(64) NOT NULL CHECK(LENGTH(hash) = 64),
    salt VARCHAR(64) NOT NULL CHECK(LENGTH(salt) = 64)
);
```

### users.company

```sql
CREATE TABLE users.company(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    user_id UUID REFERENCES users.user(id) ON DELETE CASCADE NOT NULL,
    current_billing_id UUID REFERENCES subscription.billing_record(id) ON DELETE RESTRICT NOT NULL,
    company_name VARCHAR(64) CHECK(company_name ~ '^(?!\s)(?!.*\s$)(?=.*[a-zA-Z0-9])[a-zA-Z0-9 ''~?!]{2,}$') NOT NULL,
    industry VARCHAR(8) REFERENCES industries(id) ON DELETE SET DEFAULT DEFAULT 'ELSE' NOT NULL,
    country VARCHAR(2) REFERENCES countries(id) ON DELETE SET DEFAULT NULL,
    UNIQUE(company_name)
);
```

### users.employee

```sql
CREATE TABLE users.employee(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    user_id UUID REFERENCES users.user(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES users.company(id) ON DELETE CASCADE NOT NULL
);
```

### subscription.billing_record

```sql
CREATE TABLE subscription.billing_record(
    id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES users.company(id) ON DELETE CASCADE NOT NULL,
    plan_id INTEGER REFERENCES subscription.plan(id) ON DELETE CASCADE NOT NULL,
    plan_start DATE DEFAULT NOW() NOT NULL,
    plan_end DATE GENERATED ALWAYS AS (plan_start + INTERVAL '1 month') STORED NOT NULL,
    billed_at DATE,
    user_count INTEGER DEFAULT 0 NOT NULL CHECK(user_count >=0),
    files_uploaded INTEGER DEFAULT 0 NOT NULL CHECK(files_uploaded >= 0)
);
```

### subscription.plan

```sql
CREATE TABLE subscription.plan(
    id SERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(63) NOT NULL,
    file_limit INTEGER CHECK((file_limit > 0)),
    user_limit INTEGER CHECK((user_limit > 0)),
    price money NOT NULL CHECK(price >= '$0'),
    file_price money CHECK(file__price >= '$0'),
    user_price money CHECK(user_price >= '$0'),
    UNIQUE(name)
);
```

### TYPES

#### INDUSTRIES

```sql
CREATE TABLE INDUSTRIES(
    id VRACHAR(8) PRIMARY KEY CHECK(LENGTH(id) > 1) NOT NULL,
    name VARCHAR(64) NOT NULL CHECK(LENGTH(name) > 2) NOT NULL
);
```

#### COUNTRIES

```sql
CREATE TABLE COUNTRIES(
    id VARCHAR(2) PRIMARY KEY CHECK(LENGTH(id) = 2) NOT NULL,
    name VARCHAR(64) CHECK(LENGTH(name > 2) NOT NULL
);
```

#### ROLE

```sql
CREATE TYPE ROLE AS ENUM ('COMPANY', 'EMPLOYEE')
```
