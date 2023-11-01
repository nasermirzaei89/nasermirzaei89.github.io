---
title: Setting Up a Highly Available etcd Cluster for Kubernetes
tags: etcd kubernetes
---

Before set up, we should know what is it and why we need it?
It helps us to understand how important it is (or it's not).

## What is etcd

According to https://etcd.io/docs/v3.5/faq/#what-is-etcd

> etcd is a consistent distributed key-value store.
> Mainly used as a separate coordination service, in distributed systems.
> And designed to hold small amounts of data that can fit entirely in memory.

## Why Kubernetes uses etcd

Kubernetes uses etcd as its distributed key-value store to maintain a reliable and consistent data store for managing
the cluster's configuration, state, and metadata.
Etcd provides a highly available and strongly consistent data store,
which is essential for ensuring that Kubernetes components can communicate and coordinate effectively across different
nodes in the cluster.
It allows Kubernetes to store and retrieve critical information about the desired state of the system,
making it resilient and capable of handling failures while ensuring that the desired configurations are maintained.

## Why we need high available

A highly available etcd cluster is crucial for Kubernetes because it serves as the authoritative data store for the
cluster's configuration and state.
Kubernetes relies on etcd to store information about the desired state of applications and resources,
as well as the current state of the cluster.
If etcd were to become unavailable or suffer from data inconsistencies,
it could lead to cluster-wide outages, data loss, or unreliable resource management.
High availability in etcd ensures that even in the presence of hardware failures or network issues,
Kubernetes can continue to function, maintain cluster state,
and provide the desired services with minimal disruption,
making it a critical component for the reliability and resilience of a Kubernetes cluster.

## Prerequisites

In this article, I used [Hetzner Cloud](https://hetzner.cloud/?ref=VJt8VCfetCEE) as it's a reliable,
not expensive cloud provider with acceptable modern technologies.

This link contains a refer id, and by using it, you will receive €20 credit by signing up,
and I'll receive €10 if you spend at lease €10.

I use Hetzner, because it does not have its own Kubernetes service.
So, you can find articles and solutions for running your own cluster on it easier.

In contrast, with other providers, you may be constrained to utilize their proprietary managed Kubernetes service,
which can often be a sensible choice.

Also, you can use any service provider or your own infrastructure as long as the servers have access to each other and
the internet.

### Hetzner CLI

For creating networks, subnets, and servers, I use `hcloud` to access my Hetzner account.

You can install it from: https://github.com/hetznercloud/cli

I used this command for macOS:

```shell
brew install hcloud
```

After installing it, you need to obtain an API Token by creating a Project in your Hetzner Cloud,
and going to "Security" menu, then "API Tokens" tab. Generate a token with "Read & Write" permission.

In your local terminal, enter:

```shell
hcloud context create <PROJECT_NAME>
```

And enter the generated token.

It will store the context in `~/.config/hcloud/cli.toml` if it's valid,
and will set it the default context to use.
You can switch between contexts by `hcloud context use <CONTEXT>`.

### OpenSSL

I used [OpenSSL](https://www.openssl.org/) to create Certificate Authorities and generate Certificates.
You can use other tools like [CFSSL](https://github.com/cloudflare/cfssl),
or [EasyRSA](https://github.com/OpenVPN/easy-rsa).
More info at https://kubernetes.io/docs/tasks/administer-cluster/certificates/

In macOS, enter:

```shell
brew install openssl@3
```

### SSH and SCP

Also, I use `ssh` to connect to servers, and `scp` to copy files to them.

### Provision Servers

Create a network:

```shell
NETWORK_NAME=network-1
hcloud network create --name ${NETWORK_NAME} --ip-range 10.1.0.0/16
```

I used "US East" for location.

```shell
hcloud network add-subnet ${NETWORK_NAME} --network-zone us-east --type server --ip-range 10.1.1.0/24
```

It's better add your/a SSH Key to the project.
So, it can be used for connecting to the servers.

```shell
hcloud ssh-key create --name ssh-key-1 --public-key-from-file ~/.ssh/id_ed25519.pub
```

Use your own ssh public key address instead of `id_ed25519.pub`.

Minimum node counts for High Availability is 3.

```shell
NODES=(node-1 node-2 node-3)

for node in ${NODES}; do
  hcloud server create \
    --name ${node} \
    --network ${NETWORK_NAME} \
    --image ubuntu-22.04 \
    --type cpx11 \
    --ssh-key ssh-key-1 \
    --location ash \
    --label etcd=true \
    --label cluster=cluster-1
done
```

I used the lightest server type (cpx11) for testing purposes.
Also, I used labels for selecting nodes in lists later.

You can use any name you wish for the servers.

## Provisioning a CA and Generating TLS Certificates

### Create the CA Certificate and Key

```shell
openssl genrsa -out etcd-ca.key 2048
openssl req -x509 -new -nodes -key etcd-ca.key -subj "/CN=etcd-ca" -days 5475 -out etcd-ca.crt
```

5475 Days is 15 years.

### Generate and Sign etcd Member Certificates

Create a template file for config:

```shell
cat <<EOF | sudo tee etcd-server.conf.tpl
[ req ]
default_bits = 2048
prompt = no
default_md = sha256
req_extensions = req_ext
distinguished_name = dn

[ dn ]
CN = <NODE_NAME>

[ req_ext ]
subjectAltName = @alt_names

[ alt_names ]
DNS.1 = <NODE_NAME>
DNS.2 = localhost
IP.1 = 127.0.0.1
IP.2 = <NODE_INTERNAL_IP>
IP.3 = <NODE_EXTERNAL_IP>

[ v3_ext ]
subjectAltName=@alt_names
EOF
```

We need 2 certificates for each etcd node.
Server certificate for authenticating client requests,
and Peer certificate to communicate with other nodes.

Although it's not mandatory,
using separate certificates for different purposes adds an extra layer of security
and minimizes the risk of compromise in a distributed system like etcd.

For each member (Server Cert):

```shell
for NODE in $(hcloud server list --selector cluster=cluster-1 --selector etcd=true -o noheader -o columns=name); do
  openssl genrsa -out ${NODE}-etcd-server.key 2048

  EXTERNAL_IP=$(hcloud server describe ${NODE} -o format='{{.PublicNet.IPv4.IP}}')
  INTERNAL_IP=$(hcloud server describe ${NODE} -o format='{{ (index .PrivateNet 0).IP}}')

  cat etcd-server.conf.tpl | sed -e "s/\<NODE_NAME>/${NODE}/" -e "s/\<NODE_INTERNAL_IP>/${INTERNAL_IP}/" -e "s/\<NODE_EXTERNAL_IP>/${EXTERNAL_IP}/" > ${NODE}-etcd-server.conf 

  openssl req -new -key ${NODE}-etcd-server.key \
    -config ${NODE}-etcd-server.conf \
    -out ${NODE}-etcd-server.csr
  openssl x509 -req -in ${NODE}-etcd-server.csr -CA etcd-ca.crt -CAkey etcd-ca.key \
    -sha256 -CAcreateserial -days 730 -extensions v3_ext -extfile ${NODE}-etcd-server.conf \
    -out ${NODE}-etcd-server.crt
done
```

For each member (Peer Cert):

```shell
for NODE in $(hcloud server list --selector cluster=cluster-1 --selector etcd=true -o noheader -o columns=name); do
  openssl genrsa -out ${NODE}-etcd-peer.key 2048

  EXTERNAL_IP=$(hcloud server describe ${NODE} -o format='{{.PublicNet.IPv4.IP}}')
  INTERNAL_IP=$(hcloud server describe ${NODE} -o format='{{ (index .PrivateNet 0).IP}}')

  cat etcd-server.conf.tpl | sed -e "s/\<NODE_NAME>/${NODE}/" -e "s/\<NODE_INTERNAL_IP>/${INTERNAL_IP}/" -e "s/\<NODE_EXTERNAL_IP>/${EXTERNAL_IP}/" > ${NODE}-etcd-peer.conf 

  openssl req -new -key ${NODE}-etcd-peer.key \
    -config ${NODE}-etcd-peer.conf \
    -out ${NODE}-etcd-peer.csr
  openssl x509 -req -in ${NODE}-etcd-peer.csr -CA etcd-ca.crt -CAkey etcd-ca.key \
    -sha256 -CAcreateserial -days 730 -extensions v3_ext -extfile ${NODE}-etcd-peer.conf \
    -out ${NODE}-etcd-peer.crt
done
```

### Copy Certificates to servers

```shell
for NODE in $(hcloud server list --selector cluster=cluster-1 --selector etcd=true -o noheader -o columns=name); do
  scp etcd-ca.crt root@$(hcloud server describe ${NODE} -o format='{{.PublicNet.IPv4.IP}}'):~/etcd-ca.crt
  scp ${NODE}-etcd-server.key root@$(hcloud server describe ${NODE} -o format='{{.PublicNet.IPv4.IP}}'):~/etcd-server.key
  scp ${NODE}-etcd-server.crt root@$(hcloud server describe ${NODE} -o format='{{.PublicNet.IPv4.IP}}'):~/etcd-server.crt
  scp ${NODE}-etcd-peer.key root@$(hcloud server describe ${NODE} -o format='{{.PublicNet.IPv4.IP}}'):~/etcd-peer.key
  scp ${NODE}-etcd-peer.crt root@$(hcloud server describe ${NODE} -o format='{{.PublicNet.IPv4.IP}}'):~/etcd-peer.crt
done
```

## Install

Now, we can go to the servers to continue the work on them.

### SSH to Node

On all servers:

```shell
ssh root@$(hcloud server describe <NODE_NAME> -o format='{{.PublicNet.IPv4.IP}}')
```

Replace `<NODE_NAME>` with real node names.

### Install etcd

```shell
apt update
apt install -y etcd
```

In this article etcd 3.5.10 is released.
Future releases may have a different configuration.

## Configure

Now etcd is installed and running in single mode on each node.
So, we need to update the configurations.

I create a subdirectory for `etcd` in its favorite parent directory.
Move and rename all certificates there.
Then, change the directory owner to the use `etcd`, which has been created on installing etcd.

```shell
mkdir -p /etc/etcd
mv ~/etcd-ca.crt /etc/etcd/ca.crt
mv ~/etcd-server.key /etc/etcd/server.key
mv ~/etcd-server.crt /etc/etcd/server.crt
mv ~/etcd-peer.key /etc/etcd/peer.key
mv ~/etcd-peer.crt /etc/etcd/peer.crt
chown -R etcd /etc/etcd
```

Now we need to update etcd config values to make them a cluster.

For some values we need to provide them on our own machine which the `hcloud` cli is configured.

I wrote this script to provide value of `ETCD_INITIAL_CLUSTER` variable:

```shell
ARRAY=()
for NODE in $(hcloud server list --selector etcd=true -o noheader -o columns=name); do
  ARRAY+=("${NODE}=https://$(hcloud server describe ${NODE} -o format='{{ (index .PrivateNet 0).IP}}'):2380")
done

ETCD_INITIAL_CLUSTER=$(printf ",%s" "${ARRAY[@]}")
ETCD_INITIAL_CLUSTER=${ETCD_INITIAL_CLUSTER:1}
echo $ETCD_INITIAL_CLUSTER
```

Run this on your own machine and use it when editing the etcd config file.

Also, you need each server internal ip.
Make sure to use the correct value on each server.

Then, we need to uncomment and update these values in the `/etc/default/etcd` file.

* ETCD_NAME: use hostname value for each server.
* ETCD_INITIAL_CLUSTER: $ETCD_INITIAL_CLUSTER
* ETCD_INITIAL_ADVERTISE_PEER_URLS: `https://${INTERNAL_IP}:2380`
* ETCD_LISTEN_PEER_URLS: `https://${INTERNAL_IP}:2380`
* ETCD_LISTEN_CLIENT_URLS: `https://${INTERNAL_IP}:2379,https://127.0.0.1:2379`
* ETCD_ADVERTISE_CLIENT_URLS: `https://${INTERNAL_IP}:2379`
* ETCD_CLIENT_CERT_AUTH: `true`
* ETCD_PEER_CLIENT_CERT_AUTH: `true`
* ETCD_TRUSTED_CA_FILE: `/etc/etcd/ca.crt`
* ETCD_CERT_FILE: `/etc/etcd/server.crt`
* ETCD_KEY_FILE: `/etc/etcd/server.key`
* ETCD_PEER_TRUSTED_CA_FILE: `/etc/etcd/ca.crt`
* ETCD_PEER_CERT_FILE: `/etc/etcd/peer.crt`
* ETCD_PEER_KEY_FILE: `/etc/etcd/peer.key`

Use real values in the above variables.

Now restart etcd service on each server:

```shell
systemctl restart etcd.service
```

If it didn't restart successfully, check the etcd log with:

```shell
journalctl -xeu etcd.service
```

## Verify

To verify if it works enter this command on each server:

```shell
ETCDCTL_API=3 etcdctl member list \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/etcd/ca.crt \
  --cert=/etc/etcd/server.crt \
  --key=/etc/etcd/server.key
```

Output should be like:

```
11a85cd56d9530bf, started, node-1, https://10.1.1.1:2380, https://10.1.1.1:2379
6e6ca551d2049908, started, node-2, https://10.1.1.2:2380, https://10.1.1.2:2379
cba426eb7a695eef, started, node-3, https://10.1.1.3:2380, https://10.1.1.3:2379
```

You can store a value in a node:

```shell
ETCDCTL_API=3 etcdctl set foo bar \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/etcd/ca.crt \
  --cert=/etc/etcd/server.crt \
  --key=/etc/etcd/server.key
```

and check it on other nodes:

```shell
ETCDCTL_API=3 etcdctl get foo \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/etcd/ca.crt \
  --cert=/etc/etcd/server.crt \
  --key=/etc/etcd/server.key
```

It should show `bar` as value.

## Further considerations

You now have a fully operational etcd cluster, which you can integrate into your Kubernetes environment.

When updating, to ensure its continued reliability, remember to consult changelogs to avoid disruptions or data loss.

Additionally, please be aware that server and peer certificates have a two-year validity period,
so it's essential to proactively renew and replace them before they expire.
