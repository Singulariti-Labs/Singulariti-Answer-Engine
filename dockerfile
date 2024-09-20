FROM node:18-alpine

ARG SEARXNG_API_URL

WORKDIR /home/singulariti-answer-engine

COPY . /home/singulariti-answer-engine/

RUN sed -i "s|SEARXNG = \".*\"|SEARXNG = \"${SEARXNG_API_URL}\"|g" /home/singulariti-answer-engine/config.toml

RUN npm install
RUN npm run build

CMD ["npm", "run", "start"]