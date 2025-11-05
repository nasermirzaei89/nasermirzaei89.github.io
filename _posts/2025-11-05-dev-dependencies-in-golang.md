---
tags: Golang Tooling
description: Using the Go tool to run project tooling with pinned versions
---

In [Go 1.24](https://go.dev/doc/go1.24), the Go team introduced new functionality for managing developer tooling dependencies via the `-tool` flag for `go get`.

Before this, if your project needed tools such as [github.com/air-verse/air](https://github.com/air-verse/air) or [golangci-lint](https://golangci-lint.run/) (tools written in Go), you had to install them directly on your machine and ensure their versions matched across all developers’ machines.

Now, you can add them to your `go.mod` file with a defined version.

For example, imagine you’re using golangci-lint. You can add it to your `go.mod` file with:

```shell
go get -tool github.com/golangci/golangci-lint/v2/cmd/golangci-lint
```

It downloads latest version.
Or you can download a specific version by:

```shell
go get -tool github.com/golangci/golangci-lint/v2/cmd/golangci-lint@v2.4.0
```

Then run it with:

```shell
go tool golangci-lint run
```

You no longer need to install golangci-lint globally or rely on a globally installed binary that might have a different version.
On every developer machine and in CI, it runs with the specified version.

If you check your `go.mod` file, you’ll see a line has been added:

```gomod

tool github.com/golangci/golangci-lint/v2/cmd/golangci-lint
```

It also appears as an indirect dependency:

```gomod
require (
    ...
    github.com/golangci/golangci-lint/v2 v2.6.1 // indirect
    ...
)
```

In short, managing developer tools with go get -tool and go tool delivers:

- Reproducible, pinned versions across machines and CI
- No global installs; tools are isolated per module
- Faster onboarding with fewer manual steps
- Controlled, reviewable upgrades via go.mod diffs
- Cleaner, hermetic CI pipelines

Adopt it to keep tooling predictable and maintenance low-friction.
