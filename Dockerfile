# Dockerfile for building a jiraflux image based on Alpine
# NOTE: You must create a jiraflux-config.json configuration file
#       before running docker build!
#
FROM mhart/alpine-node
RUN apk update && apk upgrade && apk add git
COPY *.js* /jiraflux/
WORKDIR /jiraflux
RUN npm install
ENTRYPOINT [ "npm", "start" ]
