---
tags: Kubernetes
description: Are your namespace stock at terminating state? use this solution to get rid of it!
---

## Problem

Sometimes after deleting a namespace (for example `foo`), it sticks on "Terminating" state, and when you enter:

```sh
kubectl delete namespace foo
```

You get:

```
Error from server (Conflict): Operation cannot be fulfilled on namespaces "foo": The system is ensuring all content is removed from this namespace.  Upon completion, this namespace will automatically be purged by the system.
```

## Solution

Let's get rid of `foo` namespace!

Run this command:

```sh
kubectl get namespace foo -o json > tmp.json
```

Open `tmp.json` and remove `kubernetes` from `finalizers`.
Just save it!

Now you need your cluster address:

```sh
kubectl cluster-info
```

Then run this command:

```sh
curl -k -H "Content-Type: application/json" -X PUT --data-binary @tmp.json http(s)://[IP]:[PORT]/api/v1/namespaces/[NAMESPACE]/finalize
```

Make sure to use your cluster address!

Oh! An error! You can't do this action as anonymous?

```
namespaces "foo" is forbidden: User "system:anonymous" cannot update namespaces/finalize in the namespace "foo"
```

Don't worry! Use magic kubernetes proxy:

```sh
kubectl proxy  
// Starting to serve on 127.0.0.1:8001
```

::: tip
Note: this command won't finish. So you can use `&` at the end, or continue in a new terminal.
:::

Then, run the last command again, and use proxy IP and Port.

Now check your namespaces:

```sh
kubectl get namespaces
```

Namespace `foo` has been gone!
