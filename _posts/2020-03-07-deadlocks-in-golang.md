---
tags: Deadlock Golang Goroutine
description: A deadlock happens when a goroutine is reading from or writing a channel that never can be used  
---

## Problem

Run this golang code:

```go
package main

func main() {
	ch := make(chan bool)
	ch <- true
}

```

You can run it here: [https://play.golang.org/p/Eqa5-D2bC0i](https://play.golang.org/p/Eqa5-D2bC0i)

The last line waits forever for someone to read the channel. So, the program will be stuck and never ends.

It's a **Deadlock**.

Fortunately, Golang detects deadlocks in runtime, and you will get this:

> The First time I faced deadlock was when I was working on a [WebAssembly](https://github.com/golang/go/wiki/WebAssembly) program.

```
fatal error: all goroutines are asleep - deadlock!

goroutine 1 [chan send]:
main.main()
	/tmp/sandbox459053840/prog.go:5 +0x60

Program exited: status 2.
```

A deadlock occurs when a goroutine is waiting for a channel forever.

There are some more examples of deadlock

## Example I

When a goroutine writes to a channel that will never be read. Like the above code in the first of this article.

## Example II

When a goroutine reads from a channel that no one will write to it:

```go
package main

func main() {
	ch := make(chan bool)
	<- ch
}
```

## Example III

When a group goroutines wait for each other to fill channels,
but they can't fill them because they are waiting for a channel to fill:

```go
package main

func main() {
	ch1 := make(chan int)
	ch2 := make(chan int)
	done := make(chan bool)

	go func() {
		<-ch1
		ch2 <- 1
	}()

	go func() {
		<-ch2
		ch1 <- 1
		done <- true
	}()

	<-done
}
```

![Gridlock on a network of two-way streets. The red cars are those causing the gridlock by stopping in the middle of the intersection.]({{ "/assets/gridlock.svg" | absolute_url }})

## Sync Package

Deadlock also occurs in [sync](https://golang.org/pkg/sync/) package when a goroutine is waiting for a lock forever.

## Last words 

Source codes with deadlock occurrence compile and build successfully,
but panics in runtime.

So, care when you use channels (and sync package),
and write good tests to trap deadlocks before deployment.

:sparkles: _[Gridlock](https://en.wikipedia.org/wiki/Gridlock) image is from [Wikipedia](https://wikipedia.org/)_
