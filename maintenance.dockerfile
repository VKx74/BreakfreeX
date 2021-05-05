FROM nginx:alpine
COPY nginx-maintenance.conf /etc/nginx/nginx.conf
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*
COPY ./static_pages/maintenance .

RUN ls -l

EXPOSE 80
#EXPOSE 443

STOPSIGNAL SIGTERM

CMD ["nginx", "-g", "daemon off;"]