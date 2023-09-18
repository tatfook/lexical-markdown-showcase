FROM nginx

RUN rm /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/nginx.conf

ADD nginx/default.conf /etc/nginx/conf.d/default.conf
ADD nginx/nginx.conf /etc/nginx/nginx.conf

WORKDIR /usr/share/nginx/html
#COPY --from=builder /code/dist .
COPY dist .
EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
