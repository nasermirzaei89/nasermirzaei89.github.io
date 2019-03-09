---
tags: Goland Docker Alpine
---

Docker is so popular these days. It's so good to build your go applications in docker. Here I show you how to build a go application in docker without even installing golang on your machine.

## Write the application

I use previous post application: [Here](/2018/12/14/using-go-modules/) :smile:

## Write Dockerfile

First of all, we use Go 1.11 image:

```Dockerfile
FROM golang:1.11
```

Go 1.11 have been used because we use go modules for dependency injection.

Then, select the working directory:

```Dockerfile
WORKDIR /src
```

Now, copy source to working directory:

```Dockerfile
COPY . .
```

We copied the project source to `/src` directory in the image. The first dot means current directory in your system, and the second one means working directory in the image.

Let's build the binary

```Dockerfile
RUN go build -o hello-world
```

Now, set default command to run the application:

```Dockerfile
CMD ["/src/hello-world"]
```

It's time to build the image.

```sh
docker build --tag user/hello-world .
```

Replace `user/hello-world` with your image name.

```
Sending build context to Docker daemon  4.096kB
Step 1/5 : FROM golang:1.11
 ---> 2422e4d43e15
Step 2/5 : WORKDIR /src
 ---> Running in 84e1bdb9d413
Removing intermediate container 84e1bdb9d413
 ---> 72ebb156c493
Step 3/5 : COPY . .
 ---> a1b6a5f2d48b
Step 4/5 : RUN go build
 ---> Running in adf1a7785c09
go: finding github.com/gin-gonic/gin v1.3.0
go: downloading github.com/gin-gonic/gin v1.3.0
go: finding github.com/mattn/go-isatty v0.0.4
go: finding github.com/gin-contrib/sse latest
go: finding github.com/ugorji/go/codec latest
go: finding github.com/golang/protobuf/proto latest
go: finding gopkg.in/go-playground/validator.v8 v8.18.2
go: downloading github.com/mattn/go-isatty v0.0.4
go: finding gopkg.in/yaml.v2 v2.2.2
go: downloading github.com/gin-contrib/sse v0.0.0-20170109093832-22d885f9ecc7
go: downloading gopkg.in/go-playground/validator.v8 v8.18.2
go: downloading gopkg.in/yaml.v2 v2.2.2
go: downloading github.com/ugorji/go/codec v0.0.0-20181209151446-772ced7fd4c2
go: finding github.com/golang/protobuf v1.2.0
go: downloading github.com/golang/protobuf v1.2.0
go: finding gopkg.in/check.v1 v0.0.0-20161208181325-20d25e280405
Removing intermediate container adf1a7785c09
 ---> ff0c7547ca25
Step 5/5 : CMD ["/src/hello-world"]
 ---> Running in 07ee96627074
Removing intermediate container 07ee96627074
 ---> ddb80abe9fb5
Successfully built ddb80abe9fb5
Successfully tagged user/hello-world:latest
```

Image build from source. Now you can run your image:

```sh
docker run -p 8080:8080 user/hello-world
```

Then test your app:

```sh
curl http://127.0.0.1:8080/ping
```

Output:

```json
{"message":"pong"}
```

## Reduce image size

### Separate build and run images

Golang 1.11 image is `775MB`. You can only use this image or newer as the builder image. Edit `Dockerfile`:

```Dockerfile
FROM golang:1.11 AS build

WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o hello-world

FROM alpine
COPY --from=build /src/hello-world /

CMD ["/hello-world"]
```

First, we built binary in `golang:1.11`. 

Then have copied binary in the second container.

Note: you must set `CGO_ENABLED=0` on build binary, because, you can't run it in the alpine with cgo enabled.

Now image size decreased to `19.2MB`.

### Strip the binary

We can use the `-s` and `-w` linker flags to strip the debugging information. Edit `Dockerfile` and change build line:

```Dockerfile{5}
FROM golang:1.11 AS build

WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o hello-world -ldflags="-s -w"

FROM alpine
COPY --from=build /src/hello-world /

CMD ["/hello-world"]
```

Now check the image size. it's `15.6MB`.

## Cache vendors

On every build, build stage will download vendors. You can cache this step by doing a trick in your `Dockerfile`. Add an extra stage to it:

```Dockerfile
FROM golang:1.11 AS base

WORKDIR /src
ENV GO111MODULE=on
COPY go.mod .
COPY go.sum .
RUN go mod download

FROM base AS build

COPY . .
RUN CGO_ENABLED=0 go build -o hello-world -ldflags="-s -w"
FROM alpine
COPY --from=build /src/hello-world /

CMD ["/hello-world"]
```

In new `Dockerfile` stage (named as `base`), we force the go compiler to use modules, then copy `go.mod` and `go.sum` files and run `go mod download`.
These steps will cache if `go.mod` and `go.sum` files were same as previous build.

Now use `base` stage as image for `build` stage and do build as same as past.

## Conclusion

By using docker images we can develop and build applications faster in an OS independent environment. So, it's useful to build you go (and all other languages) applications in Docker containers.

Good development! :wink:
