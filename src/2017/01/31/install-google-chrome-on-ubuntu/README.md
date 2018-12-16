---
tags: Ubuntu Google_Chrome Chromium Proxy
type: post
date: 2017/01/31
---
# Install Google Chrome on Ubuntu

![Install Google Chrome on Ubuntu](./ubuntu_16.04_xenial_chrome_browser.png)

If you cannot access to google repository in your country add a proxy to apt-get. create a config file in /etc/apt/apt.conf.d/ and add this code to it:

```bash
Acquire::http::Proxy "http://username:password@proxy.xxx.xx:80XX";
```

replace proxy URL with your own URL.

Setup key with:

```bash
wget -q -O — https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
```

Then setup repository with:

```bash
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
```

Setup package with:

```bash
sudo apt-get update
sudo apt-get install google-chrome-stable
```

At the end you can read this article for the difference between Google Chrome and Chromium:

[Chromium Browser vs Google Chrome](https://chromium.googlesource.com/chromium/src/+/master/docs/chromium_browser_vs_google_chrome.md)

<Disqus/>
