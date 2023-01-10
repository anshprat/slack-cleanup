FROM golang:latest as build
RUN mkdir /app
ADD . /app/
WORKDIR /app
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -o slack-cleanup

FROM scratch
ADD https://curl.haxx.se/ca/cacert.pem /etc/ssl/certs/ca-certificates.crt
COPY --from=build /app/slack-cleanup /bin/slack-cleanup
CMD ["/bin/slack-cleanup"]