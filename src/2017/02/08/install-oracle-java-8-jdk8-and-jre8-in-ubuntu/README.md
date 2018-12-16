---
tags: Ubuntu Oracle Java Aptitude JDK
type: post
date: 2017/02/08
---
# Install Oracle Java 8 (JDK8 and JRE8) in Ubuntu

Currently, java stable version is 8.

![Oracle Java](./oracle-java.png)

To install it do these steps:

```bash
sudo add-apt-repository ppa:webupd8team/java
sudo apt-get update
sudo apt-get install oracle-java8-installer
```

If a 503 error occurred, you are so bad luck because of restricted countries:

<http://www.oracle.com/us/products/export/export-regulations-345813.html>

So you must proxy your aptitude. edit /etc/apt/apt.conf file and add these lines:

```bash
Acquire::http::Proxy "your-proxy-url";
Acquire::https::Proxy "your-proxy-url";
```

Fill with your correct proxy URL. then do install steps again.

Good luck!

<Disqus/>
