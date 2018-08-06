FROM node:alpine as builder
LABEL stage=intermediate
RUN mkdir -p /srv/http
WORKDIR /srv/http
COPY package.json yarn.lock /srv/http/
RUN yarn --pure-lockfile
COPY . /srv/http
RUN yarn build

FROM nginx:stable-alpine
LABEL Description="The SeFilm frontend served by nginx"
COPY nginx.conf /etc/nginx/nginx.conf
RUN mkdir -p /srv/
COPY --from=builder /srv/http/build /srv/http
EXPOSE 80
RUN chown nginx:nginx /srv/http -R
