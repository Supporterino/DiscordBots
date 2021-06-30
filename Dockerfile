FROM node:14
WORKDIR /usr
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src
RUN ls -a
RUN npm install
RUN npm run build

## this is stage two , where the app actually runs
FROM node:14-alpine
WORKDIR /usr
COPY package.json ./
RUN npm install --only=production
COPY --from=0 /usr/build .
RUN npm install pm2 -g
CMD ["node","bot.js"]