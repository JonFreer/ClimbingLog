# Climb Tracker

## Development

### Setup

- Generate certificates using [mkcert](https://github.com/FiloSottile/mkcert):

      cd traefik/certs
      mkcert -cert-file dev.cert -key-file dev.pem "climbing.localhost" "*.climbing.localhost"
      
- Create a `.env` file using the `example.env` template:

      cp example.env .env

- Download and build docker image dependencies:

      INFRA=dev make pull
      INFRA=dev make build

- Launch application:

      INFRA=dev make up
      
The infrastructure should now be running at `climbing.localhost`, make sure that
this resolves to `127.0.0.1`!

## API

The api can be found at betterstreets.localhost/api/docs

## Update user to super-user
`UPDATE "user" SET is_superuser = 't' WHERE id = '{id}';`
