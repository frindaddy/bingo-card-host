FROM node:20-alpine AS ui-build
WORKDIR /usr/src/app
RUN cd client
RUN npm install
RUN npm run build