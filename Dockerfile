FROM node:8
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY ./ ./
RUN cat ./server/app.js
RUN npm run build-docker
EXPOSE 8081
EXPOSE 8443
RUN git rev-parse --short HEAD
CMD [ "npm", "start" ]
HEALTHCHECK --interval=15s --timeout=3s \
  CMD curl -f https://localhost:8081 || exit 1
