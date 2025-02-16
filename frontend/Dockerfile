FROM node:alpine
WORKDIR /app
COPY package.json .
RUN yarn
# copy all files
COPY . .
CMD ["yarn", "dev", "--debug"]