FROM golang:1.26-alpine

WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .
RUN go build -o /usr/local/bin/moneymate-api ./cmd/api
RUN go build -o /usr/local/bin/moneymate-migrate ./cmd/migrate

EXPOSE 8080

CMD ["moneymate-api"]
