# DataLens-SaaS

See database design in `data-design.sql` file

## Setup

- compose docker with:

``` sh
docker-compose up --build
```

- download and up a .env file in the root dir of the project (see the .env file in the releases section of this repo)

- It is important to have the `data-design.sql` file, so the database could load all necessary tables and data

## Overview

- Express.js as backend framework
- TypeORM as ORM
- Jest for testing
- MVC Pattern
- PostgreSQL for SQL Database
- Docker compose with postgres and node
- JWT for authentication.
- NodeMailer as a mail client
- Brevo as third partymail service provider

## API Endpoints

### Authentication

- **Register Company**: `POST /api/register` with `email`, `company_name`, `industry`, `country`, and `password` in query parameters. Registers a new company.
- **Resend Confirmation Email**: `POST /api/register/:email` to resend the confirmation email for account activation.
- **Login**: `POST /api/login` with `email` and `password` in query parameters to authenticate a user.
- **Activate Account**: `GET /api/activation/:token` to activate the user account using the provided token.

### Subscription Management

- **View Subscription**: `GET /api/subscription` to get the subscription details for the logged-in company.
- **Change Tier**: `PATCH /api/subscription/:tier` to change the subscription tier for the logged-in company.
- **Pay Subscription**: `POST /api/subscription/:amount` to make a payment for the subscription.

### Profile and Company Management

- **View Profile**: `GET /api/profile` to get the profile information of the logged-in user.
- **Update Company Details**: `PATCH /api/profile` with `email`, `company_name`, `industry`, and `country` in query parameters to update the company details.

### File Management

- **Upload File**: `POST /api/file` to upload a file (supported formats: csv, xls, xlsx) with visibility settings.
- **Delete File**: `DELETE /api/file/:name` to delete a specified file.
- **List Files**: `GET /api/file` to list accessible files with pagination.
- **File Access Control**: Add (`POST /api/file/access/:name`) or remove (`DELETE /api/file/access/:name`) access to a file.

### Employee Management

- **Add Employee**: `POST /api/employee/:email` to add an employee to the company.
- **Remove Employee**: `DELETE /api/employee/:email` to remove an employee from the company.
- **List Employees**: `GET /api/employee` to list the emails of all employees with pagination.

### Miscellaneous

- **Change Password**: `PATCH /api/change-password` with `old_password` and `new_password` in query parameters to change the user's password.
- **List Industries and Countries**: `GET /api/list/industries`, `GET /api/list/countries`, and `GET /api/list/tiers` to list available industries, countries, and subscription tiers.

## License

This project is open-sourced under the MIT license.
