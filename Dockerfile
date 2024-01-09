FROM node:20-alpine AS ui-build
WORKDIR /usr/src/app
RUN cd client && npm install && npm run build