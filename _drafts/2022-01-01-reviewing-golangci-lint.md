---
title: Reviewing GolangCI Lint
tags: golang lint ci
---

## Introduction

In this article I want to review [GolangCI Lint](https://golangci-lint.run/),
my favorite code reviewer.

This tool help you find many potential bugs, complex codes, security issues, and forces you to write a simpler code.
Although there isn't a strict line between complexity and simplicity,
GolangCI Lint assist you in situations that are obvious and definite.
Also, you can config or disable each module that you don't want or don't believe that is usable in your code.

GolangCI Lint is a package of some other linters those are individual applications.
This is just an all-in-one tool. So I will review all of its linters.

## `deadcode`

https://github.com/remyoudompheng/go-misc/tree/master/deadcode

`deadcode` is a simple tool which detects unused declarations in a go code.
With this linter you can find and remove unused codes and make your code cleaner!

As we should use version control tools like [Git](https://git-scm.com/),
don't be afraid of deleting unused codes. You can always find the in the repository history.

Also, when you don't need a part of code that is being used before,
and after a while you need to use them again, you should think how to use them for needs of the day.

## `errcheck`

https://github.com/kisielk/errcheck

I reviewed many codes and found how many times developers doesn't check the returned errors.
Although in must cases they never throw an error, but you have to check them. Your code shouldn't be fragile.
`errcheck` is the agent to check for unchecked errors.

If it doesn't matter that a function returns error, explicitly ignore it:

```
_ = foo.Bar()
```

Or you should check it. So using this linter is a good practice.

## `gosimple`

https://github.com/dominikh/go-tools/tree/master/simple

`gosimple` find and suggest a simpler version of parts of your code.

Use it! Sometimes we have unnecessary complexity in out codes.

## `govet`

## `ineffassign`

## `staticcheck`

## `structcheck`

## `typecheck`

## `unused`

## `varcheck`

## `asciicheck`

## `bidichk`

## `bodyclose`

## `contextcheck`

## `cyclop`

## `depguard`

## `dogsled`

## `dupl`

## `durationcheck`

## `errname`

## `errorlint`

## `exhaustive`

## `exhaustivestruct`

## `exportloopref`

## `forbidigo`

## `forcetypeassert`

## `funlen`

## `gci`

## `gochecknoglobals`

## `gochecknoinits`

## `gocognit`

## `goconst`

## `gocritic`

## `gocyclo`

## `godot`

## `godox`

## `goerr113`

## `gofmt`

## `gofumpt`

## `goheader`

## `goimports`

## `golint`

## `gomnd`

## `gomoddirectives`

## `gomodguard`

## `goprintffuncname`

## `gosec`

## `ifshort`

## `importas`

## `interfacer`

## `ireturn`

## `lll`

## `makezero`

## `maligned`

## `misspell`

## `nakedret`

## `nestif`

## `nilerr`

## `nilnil`

## `nlreturn`

## `noctx`

## `nolintlint`

## `paralleltest`

## `prealloc`

## `predeclared`

## `promlinter`

## `revive`

## `rowserrcheck`

## `scopelint`

## `sqlclosecheck`

## `stylecheck`

## `tagliatelle`

## `tenv`

## `testpackage`

## `thelper`

## `tparallel`

## `unconvert`

## `unparam`

## `varnamelen`

## `wastedassign`

## `whitespace`

## `wrapcheck`

## `wsl`
