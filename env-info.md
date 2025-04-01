# Environment Variables for hosting
The following environment variables must be provided for hosting the server:

## Backend
### DATABASE_URL
The database to connect to. Must be postgres. 

Format:

`postgresql://{username}:{password}@{host}:{port}/{db_name}?sslmode=require`

Please note that username and password are included here and must also be included in the other environment variables.

### POSTGRES_USER, POSTGRES_PASSWORD
Self explanatory

### SSH_USERNAME
The username on the class server that will be connected to for processing images with ai

### SSH_KEY
The base-64 encoded ssh private key. must be a valid ecdsa key readable by paramiko.

## Frontend Server (container name server)

### SSL_KEY
The base-64 encoded ssl key. Must be a valid KEY file readable by nginx.

### SSL_CRT
The base-64 encoded ssl certificate. Must be a valid CRT file readable by nginx.

### DEFAULT_USER, DEFAULT_PASS
The credentials which nginx will use to verify connections to the server.