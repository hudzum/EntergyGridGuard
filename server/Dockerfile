FROM node:alpine AS builder
WORKDIR /app
COPY ./frontend/package.json .
RUN yarn
# copy remaining files
COPY ./frontend .
RUN yarn build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

RUN apk add apache2-utils

COPY ./server/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./server/ssl-dhparams.pem /etc/nginx/ssl/ssl-dhparams.pem

COPY ./server/setup.sh .
RUN chmod +x setup.sh

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["./setup.sh"]