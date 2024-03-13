# DataLens-SaaS

See database design in `data-design.sql` file

## Setup

1. compose docker with:

    ``` sh
    docker-compose up --build
    ```

2. create email account for docker-mailserver:

    ``` sh
    docker exec datalens-mail setup email add datalens@saas.com 1234
    ```

It is important to have the `data-design.sql` file, so the database could initialize every table and add all needed data
