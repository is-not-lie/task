FROM node

COPY package*.json .

RUN npm install --registry https://registry.npm.taobao.org

ADD . .

WORKDIR /app

EXPOSE 3000

CMD [ "npm", "start" ]
