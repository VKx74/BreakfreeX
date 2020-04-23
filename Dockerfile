FROM nginx:stable
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*
COPY ./dist/ .

RUN ls -l

EXPOSE 80
EXPOSE 443

STOPSIGNAL SIGTERM

CMD ["nginx", "-g", "daemon off;"]
