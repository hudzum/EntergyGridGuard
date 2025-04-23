# Environment Variables for hosting
The following environment variables must be provided for hosting the server:

## Backend

### PGDATABASE
postgres database name

### PGHOST, PGPORT, PGUSER, PGPASSWORD
self explanatory for postgres

### AI_API_URL
An openai compatible base_url.

### AI_API_KEY
The api key for the above endpoint. The openai unlimited budget api key we're using for this class is
sk-T8v95KvU5X4lwfJndsfh49JNgdsftNsdsfgII889s3DnfadfdsSDF and the azure key is
sk-sdfSDsagJKNDS89sdgNLDf98sdgSDKndklsagasdgDDSifjods903. <sub>(This is a joke)</sub>

### AI_MODEL
Model to use. Example "gpt-4o-mini"

## Frontend Server (container name server)

### SSL_KEY
The base-64 encoded ssl key. Must be a valid PEM private key file readable by nginx.

### SSL_CRT
The base-64 encoded ssl certificate. Must be a valid PEM certificate file readable by nginx.

### DEFAULT_USER, DEFAULT_PASS
The credentials which nginx will use to verify connections to the server.