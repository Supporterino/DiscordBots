FROM node:14
WORKDIR /usr/local/app
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src
RUN npm install -g npm
RUN npm install
RUN npm run build

# ## this is stage two , where the app actually runs
FROM node:14
WORKDIR /usr
COPY package.json ./
RUN npm install -g npm
RUN npm install
COPY --from=0 /usr/local/app/build ./
RUN npm install pm2 -g
ENV PM2_PUBLIC_KEY l531cd6zgz75xzy
ENV PM2_SECRET_KEY hzut3vcdhhgu0tg
ENV NODE_ENV production

CMD ["pm2-runtime", "index.js"]