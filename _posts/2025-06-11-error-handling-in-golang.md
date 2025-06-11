---
tags: Golang Error
description: Learn effective error handling in Golang with practical examples, best practices, and real-world use cases. Discover how to use custom errors, wrap and unwrap errors, and avoid common mistakes to write clean, maintainable Go code.
---

When we get an error in Golang, we MUST handle it immediately. There are different methods of handling errors. Go keeps things simple with its approach to error handling, making it very explicit and flexible.

## Basics of Error Handling in Go

Go uses a built-in `error` type, which is just an interface. Functions often return an `error` value as their last return parameter. If the error is not `nil`, it means something went wrong, and you must handle it.

```go
res, err := someFunction()
if err != nil {
  // handle the error
}
```

You either handle the error right there or return it up the chain.

Do not use `if err == nil` as your main conditional. It's not idiomatic Go. Checking for `err != nil` clearly signals that you're looking for the presence of an error, which matches Go's error-first mindset. Reversing this logic hurts readability and can confuse others reading your code.

## Custom Errors

Sometimes you want to act differently based on the type of error. You can define custom errors:

```go
var ErrBookNotFound = errors.New("book not found")
```

Or:

```go
type BookNotFoundError struct {
  ID string
}

func (err BookNotFoundError) Error() string {
  return fmt.Errorf("book with id '%s' not found", err.ID)
}
```

Or wrap errors with more context:

```go
return fmt.Errorf("error on insert book: %w", err)
```

This makes it easier to understand where and why an error occurred.

## Best Practices

* Always check and handle errors.
* Return early if something fails.
* Use clear and specific error messages.
* Don’t use panic unless it's truly unrecoverable.

## Error Wrapping and Unwrapping

If you expect certain errors, you can check them using `errors.Is` or `errors.As`:

```go
if errors.Is(err, ErrBookNotFound) {
  // handle not found
}
```

```go
var bookNotFoundError BookNotFoundError
if errors.As(err, &bookNotFoundError) {
  // handle not found
  // also you have access to bookNotFoundError.ID here
}
```

You can also unwrap errors to get the root cause:

```go
underlying := errors.Unwrap(err)
```

Use `errors.Unwrap` when you want to access the direct underlying error. This is useful if you want to log the root cause only, perform specific logic, or re-wrap errors in a custom chain. If you're doing error comparisons or type assertions, prefer `errors.Is` and `errors.As`.

## Use Cases by App Type

### CLI Applications

* Print meaningful errors to stderr.
* Exit with appropriate status codes.

### Web/API Applications

* Map internal errors to proper HTTP status codes.
* Hide sensitive error details from clients.

### Background Jobs / Workers

* Retry logic if it's a transient error.
* Log and monitor errors.

## Example: Handling Based on Error Type

Sometimes, we know what errors to expect and handle them accordingly:

```go
func upsertBook(book Book) error {
  res, err := getBook(book.ID)
  if err != nil {
    if errors.Is(err, ErrBookNotFound) {
      err = insertBook(book)
      if err != nil {
        return fmt.Errorf("error on insert book: %w", err)
      }

      return nil
    }

    return fmt.Errorf("error on get book: %w", err)
  }

  err = replaceBook(book.ID, book)
  if err != nil {
    return fmt.Errorf("error on replace book: %w", err)
  }

  return nil
}
```

Here, when `getBook` fails, we check if it's a not-found error, so we insert instead. If not, we return the error with context.

## Why Wrapping Errors Matters

Even if you can't handle an error, you're still responsible for reporting it clearly to the caller. Wrapping it adds valuable context:

```go
return fmt.Errorf("error on register new user: %w", err)
```

Compare these two logs:

```
context deadline exceeded
```

vs.

```
error on register new user: error on insert user to database: error on run exec: context deadline exceeded
```

This second log acts like a breadcrumb trail, making it easier to trace where the error really happened.

## Common Mistakes

* Ignoring errors (e.g., `_ = someFunc()`), unless you do it intentionally.
* Using panic for normal errors
* Losing original error details (not using `%w`)
* Writing `if err == nil` instead of `if err != nil`

## Conclusion

Error handling is not an afterthought in Go—it's part of the design. Handle every error explicitly, wrap them with context, and stay consistent. That’s how you build robust, debuggable Go apps.
