# DataLens-SaaS

See database design in `data-design.sql` file

## Setup

- compose docker with:

``` sh
docker-compose up --build
```

- insert .env file in the root dir of the project (see the .env file in the releases section of this repo)

- It is important to have the `data-design.sql` file, so the database could initialize every table and add all needed data
