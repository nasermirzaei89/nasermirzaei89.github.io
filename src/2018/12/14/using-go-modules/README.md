---
tags: Golang Go_Modules Programming Dependency_Management
type: post
date: 2018/12/14
sidebar: auto
---
# Using Go Modules

## What's this?

Go 1.11 includes preliminary support for versioned modules.
Modules are an experimental opt-in feature in Go 1.11, with the hope of incorporating feedback and finalizing the feature for Go 1.12.
Now we want to use this feature as simple as possible.

## Let's go!

First of all create a new directory everywhere you want, even out of your `$GOPATH`.
```bash
mkdir hello-world
```
```bash
cd hello-world
```
Now, you can initialize you go project with:
```bash
go mod init github.com/user/hello-world
```
Use your own repo url for module.

If you are in `$GOPATH` you will get this message:
```
go: modules disabled inside GOPATH/src by GO111MODULE=auto; see 'go help modules'
```

You can get rid of this message by changing this environment variable to `on`:
```bash
export GO111MODULE=on
```

A `go.mod` file created in your repository.
```bash
cat go.mod
```
Result:
`
module github.com/user/hello-world
`
Now start coding!

For sample code I use [Gin's Quick Start](https://github.com/gin-gonic/gin#quick-start) sample:
```go
package main

import "github.com/gin-gonic/gin"

func main() {
	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	r.Run() // listen and serve on 0.0.0.0:8080
}
```
Save this code as `main.go` in your project.

# It's time to show
You don't need to do extra works, just build your project:
```bash
go build
```
Go will start to find dependencies and builds your project
```
go: finding github.com/gin-contrib/sse latest
go: finding github.com/ugorji/go/codec latest
go: finding github.com/golang/protobuf/proto latest
go: downloading github.com/ugorji/go/codec v0.0.0-20181209151446-772ced7fd4c2
```
Build completed, check your project directory again:
```bash
ls
```
new files added:
```
go.mod // changed, check it.
go.sum // dependencies lock file
hello-world // project binary
main.go
```
Go fetched you project dependencies and added them to `go.mod` file:
```
module github.com/user/hello-world

require (
	github.com/gin-contrib/sse v0.0.0-20170109093832-22d885f9ecc7 // indirect
	github.com/gin-gonic/gin v1.3.0
	github.com/golang/protobuf v1.2.0 // indirect
	github.com/mattn/go-isatty v0.0.4 // indirect
	github.com/ugorji/go/codec v0.0.0-20181209151446-772ced7fd4c2 // indirect
	gopkg.in/go-playground/validator.v8 v8.18.2 // indirect
	gopkg.in/yaml.v2 v2.2.2 // indirect
)
```
You can see all direct and indirect dependencies.
`indirect` means that this dependency doesn't use directly in your code, and uses by your direct dependencies.

`go.sum` file stores your dependencies commit hash and version tag:
```
github.com/gin-contrib/sse v0.0.0-20170109093832-22d885f9ecc7 h1:AzN37oI0cOS+cougNAV9szl6CVoj2RYwzS3DpUQNtlY=
github.com/gin-contrib/sse v0.0.0-20170109093832-22d885f9ecc7/go.mod h1:VJ0WA2NBN22VlZ2dKZQPAPnyWw5XTlK1KymzLKsr59s=
github.com/gin-gonic/gin v1.3.0 h1:kCmZyPklC0gVdL728E6Aj20uYBJV93nj/TkwBTKhFbs=
github.com/gin-gonic/gin v1.3.0/go.mod h1:7cKuhb5qV2ggCFctp2fJQ+ErvciLZrIeoOSOm6mUr7Y=
github.com/golang/protobuf v1.2.0 h1:P3YflyNX/ehuJFLhxviNdFxQPkGK5cDcApsge1SqnvM=
github.com/golang/protobuf v1.2.0/go.mod h1:6lQm79b+lXiMfvg/cZm0SGofjICqVBUtrP5yJMmIC1U=
github.com/mattn/go-isatty v0.0.4 h1:bnP0vzxcAdeI1zdubAl5PjU6zsERjGZb7raWodagDYs=
github.com/mattn/go-isatty v0.0.4/go.mod h1:M+lRXTBqGeGNdLjl/ufCoiOlB5xdOkqRJdNxMWT7Zi4=
github.com/ugorji/go/codec v0.0.0-20181209151446-772ced7fd4c2 h1:EICbibRW4JNKMcY+LsWmuwob+CRS1BmdRdjphAm9mH4=
github.com/ugorji/go/codec v0.0.0-20181209151446-772ced7fd4c2/go.mod h1:VFNgLljTbGfSG7qAOspJ7OScBnGdDN/yBr0sguwnwf0=
gopkg.in/check.v1 v0.0.0-20161208181325-20d25e280405/go.mod h1:Co6ibVJAznAaIkqp8huTwlJQCZ016jof/cbN4VW5Yz0=
gopkg.in/go-playground/validator.v8 v8.18.2 h1:lFB4DoMU6B626w8ny76MV7VX6W2VHct2GVOI3xgiMrQ=
gopkg.in/go-playground/validator.v8 v8.18.2/go.mod h1:RX2a/7Ha8BgOhfk7j780h4/u/RRjR0eouCJSH80/M2Y=
gopkg.in/yaml.v2 v2.2.2 h1:ZCJp+EgiOT7lHqUV2J862kp8Qj64Jo6az82+3Td9dZw=
gopkg.in/yaml.v2 v2.2.2/go.mod h1:hI93XBmqTisBFMUTm0b8Fm+jr3Dg1NNxqwp+5A1VGuI=
```
It's almost done.

There is some extra commands to know:
* use `go get -u` to update all dependencies to latest **minor** version.
* use `go get -u=patch` to update all dependencies to latest **patch** version.
* `go mod tidy` prunes any no-longer-needed dependencies from `go.mod` and adds any dependencies needed for other combinations of OS, architecture, and build tags.

At the end you can check the directory that go stores modules:
```bash
cd $GOPATH/pkg/mod
```
Every module stored with multiple versions, for example:
```
github.com/gin-gonic/gin@v1.3.0
```
I have only one version of `gin` in my mod path.

Next time you want to get a dependency, go first checks mods directory, if the specific version not found, will download that. So you can cache this directory in CI servers or code.

<Disqus/>
