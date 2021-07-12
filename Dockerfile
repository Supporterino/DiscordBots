FROM node:14
WORKDIR /usr/local/app
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src
RUN npm install
RUN npm run build

# ## this is stage two , where the app actually runs
FROM node:14-alpine
WORKDIR /usr
COPY package.json ./
COPY pm2.config.js ./
RUN npm install --only=production
COPY --from=0 /usr/local/app/build ./build
RUN npm install pm2 -g
RUN pm2 link hzut3vcdhhgu0tg l531cd6zgz75xzy
CMD ["pm2","start","pm2.config.js","--env","production"]