FROM node:8
WORKDIR /app
COPY package.json /app
RUN yarn
COPY . /app
EXPOSE 3000
CMD node src/index.js