FROM golang:1.19.0-alpine3.16

WORKDIR /go/src/app
COPY go.mod go.sum ./
RUN go mod download && go mod verify
COPY . .
EXPOSE 9000
CMD go run main.go