FROM node:16-alpine

WORKDIR /workspace

COPY package*.json ./

RUN npm install

COPY . . 

EXPOSE 4500
EXPOSE 5000

CMD ["npm", "start"]
