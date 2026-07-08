---
order: 2
---
# How a Web Page Is Downloaded

A web browser shows information identified by a URL. The very first step is to use that URL to connect to a server somewhere on the internet and download the information. This article walks through precisely how that works — from parsing the URL all the way to displaying the HTML.

## Anatomy of a URL

Browsing the internet begins with a URL,[^1] a short string that identifies the particular web page the browser should visit.

```
http://example.org/index.html
```

A URL consists of three parts: the **scheme** tells you *how* to obtain the information; the **host name** tells you *where* to obtain it; and the **path** tells you *what* information to obtain. There are also optional pieces — ports, queries, and fragments — which we'll encounter later.

## Connecting to a Server

Given a URL, the browser can begin downloading the web page. First, it asks the local operating system to put it in touch with the *server* identified by the host name. The OS talks to a **Domain Name System** (DNS) server, which translates[^2] a host name like `example.org` into a destination **IP address** such as `93.184.216.34`.[^3]

Next, the OS decides which hardware (wireless or wired) is best suited to reach that destination IP address, using a *routing table*, and then employs device drivers to transmit signals over a wire or through the air.[^4] Those signals are received and forwarded by a chain of *routers*,[^5] each one picking the best direction to send the message so that it eventually arrives at its destination.[^6]

On many systems, you can establish this kind of connection by hand using `telnet`:

```
telnet example.org 80
```

The "80" is the **port** — a numeric label that tells the server which service you want to talk to. Port 80 is the standard for HTTP. You'll see output like this:

```
Trying 93.184.216.34...
Connected to example.org.
Escape character is '^]'.
```

The OS has turned the host name into an IP address and opened a connection. You can now communicate with `example.org`.[^7]

## Making an HTTP Request

Once connected, the browser asks the server for information by supplying its *path* — the part of the URL that follows the host name. The request looks like this:

```
GET /index.html HTTP/1.0
Host: example.org

```

Here, `GET` signals that the browser wants to *retrieve* information.[^8] Next comes the path, and finally `HTTP/1.0`, which tells the host that the browser speaks version 1.0 of **HTTP** (HyperText Transfer Protocol).[^9]

After the first line, each additional line contains a **header** — a name–value pair. The `Host` header tells the server which website you want.[^10] Different headers carry different meanings, but `Host` is the essential one.

Finally, a single blank line tells the host that you've finished sending headers. The entire request is plain text, which is why you can type it directly into `telnet`.[^11]

## The Server's Response

The server replies. The response opens with a status line:

```
HTTP/1.0 200 OK
```

This confirms the protocol version and indicates that the request was "OK" (status code `200`). You may recognize other codes: `404 Not Found`, `403 Forbidden`, or `500 Server Error`. There are many such codes, grouped into five categories:[^12]

- **1xx**: informational messages
- **2xx**: success
- **3xx**: follow-up action required (usually a redirect)
- **4xx**: you sent a bad request
- **5xx**: the server handled the request badly

This scheme cleverly provides two sets of error codes — 400s and 500s — so you can tell *who is at fault*.[^13]

Following the status line come the response headers, which carry metadata about the response:

```
Content-Type: text/html; charset=UTF-8
Content-Length: 1270
Last-Modified: Fri, 09 Aug 2013 23:54:35 GMT
Server: ECS (sec/96EC)
Cache-Control: max-age=604800
```

Some headers describe the content (`Content-Type`, `Content-Length`, `Last-Modified`), others describe the server (`Server`), and still others govern caching (`Cache-Control`, `Expires`, `Etag`).

After the headers comes a blank line, followed by the **body** of the response — the HTML code. The browser knows it's HTML because the `Content-Type` header says `text/html`. It's this HTML that carries the actual content of the web page.

[image-place-holder]

*Figure 1: An HTTP request and response pair are how a web browser gets web pages from a web server.*

## Programmatic Downloading

While `telnet` works well for manual exploration, a real browser does all of this in code. Let's walk through how that works, using Python as our example.

### Parsing the URL

First, we pull the scheme, host, and path out of the URL:

```python
class URL:
    def __init__(self, url):
        self.scheme, url = url.split("://", 1)
        assert self.scheme in ["http", "https"]

        if "/" not in url:
            url = url + "/"
        self.host, url = url.split("/", 1)
        self.path = "/" + url

        if self.scheme == "http":
            self.port = 80
        elif self.scheme == "https":
            self.port = 443
```

The scheme tells us whether to use plain HTTP or encrypted HTTPS. The host and path are separated by the first `/`. If the URL includes a custom port (e.g., `http://example.org:8080/index.html`), we parse that out as well.

### Creating a Socket Connection

The operating system provides a facility called **sockets** for network communication. A socket has three characteristics:

- An **address family** (`AF_INET` for internet addresses)
- A **type** (`SOCK_STREAM` for reliable, arbitrary-length data)
- A **protocol** (`IPPROTO_TCP` for the Transmission Control Protocol)[^14]

```python
import socket

s = socket.socket(
    family=socket.AF_INET,
    type=socket.SOCK_STREAM,
    proto=socket.IPPROTO_TCP,
)
s.connect((self.host, self.port))
```

The `connect` call instructs the OS to open a connection to the server at the specified host and port.

### Sending the Request

With the connection open, we transmit the HTTP request as raw bytes:

```python
request = "GET {} HTTP/1.0\r\n".format(self.path)
request += "Host: {}\r\n".format(self.host)
request += "\r\n"
s.send(request.encode("utf8"))
```

Two details matter: using `\r\n` for line endings (not just `\n`), and finishing with a blank line (`\r\n\r\n`). Without that blank line, the server will wait forever for more headers, and the browser will wait forever for a response.[^15] We also call `.encode("utf8")` because sockets transmit raw bytes, not text strings.

### Reading the Response

To read the response, we wrap the socket in a file-like object:

```python
response = s.makefile("r", encoding="utf8", newline="\r\n")
statusline = response.readline()
version, status, explanation = statusline.split(" ", 2)
```

The status line tells us whether the request succeeded. Next we read the headers:

```python
response_headers = {}
while True:
    line = response.readline()
    if line == "\r\n": break
    header, value = line.split(":", 1)
    response_headers[header.casefold()] = value.strip()
```

Headers are case-insensitive and whitespace is insignificant, so we normalize them. After the blank line, the body follows:

```python
content = response.read()
s.close()
return content
```

The `content` variable now holds the HTML document — the web page itself.

## Encrypted Connections (HTTPS)

More and more websites use the `https` scheme rather than `http`. The distinction is that **HTTPS** (HTTP over TLS — Transport Layer Security) encrypts all traffic between the browser and the server.

[image-place-holder]

*Figure 2: The difference between HTTP and HTTPS is the addition of a TLS layer.*

TLS handles encryption algorithm negotiation, key exchange, and server identity verification. Python's `ssl` library wraps all of this into a simple interface:

```python
import ssl

if self.scheme == "https":
    ctx = ssl.create_default_context()
    s = ctx.wrap_socket(s, server_hostname=self.host)
```

The `wrap_socket` call returns a new, encrypted socket that replaces the original. The `server_hostname` argument is used to verify that we're connected to the correct server.[^16]

HTTPS defaults to port 443 instead of port 80. With these additions, the browser can connect to both HTTP and HTTPS sites.

## Displaying the HTML

The HTML in the response body defines the content of the web page. HTML is made up of **tags** (wrapped in `<` and `>`) and **text**. Most tags appear in matching start and end pairs — for example, `<title>` and `</title>`. Tags can also carry attributes inside the angle brackets.

To build the simplest possible browser, we strip out the tags and print just the text:

```python
def show(body):
    in_tag = False
    for c in body:
        if c == "<":
            in_tag = True
        elif c == ">":
            in_tag = False
        elif not in_tag:
            print(c, end="")
```

This function walks through the HTML character by character, keeping track of whether we're currently inside a tag. Characters that fall outside tags are printed. It's remarkably simple — and it already works on real web pages.[^17]

Tying it all together:

```python
def load(url):
    body = url.request()
    show(body)

if __name__ == "__main__":
    import sys
    load(URL(sys.argv[1]))
```

Running `python3 browser.py http://example.org/` will print the text content of the page.

## Summary

Downloading a web page involves a surprisingly elegant chain of steps:

1. **Parse** the URL into scheme, host, port, and path.
2. **Resolve** the host name to an IP address via DNS.
3. **Connect** to the server using a TCP socket (on port 80 for HTTP, 443 for HTTPS).
4. **Send** an HTTP request — a plain-text `GET` with a `Host` header and a blank line.
5. **Read** the response: status line, headers, blank line, body.
6. **Decrypt** the connection (for HTTPS) using TLS.
7. **Display** the HTML body to the user.

What makes the web remarkable is that all of this is designed to be simple, text-based, and decentralized — so simple that you can do it by hand in `telnet`, and so universal that the same protocol works for any device, anywhere.[^18]

---

[^1]: URL stands for "uniform resource locator" — a portable (uniform) way to identify web pages (resources) and describe how to access them (locator).

[^2]: You can use a DNS lookup tool like `dig` or [nslookup.io](https://nslookup.io) to do this conversion yourself.

[^3]: Today there are two versions of IP: IPv4 (shorter, like `93.184.216.34`) and IPv6 (longer, written in hexadecimal). The principle is the same.

[^4]: On wires, communications are wrapped in ethernet frames; on wireless, even more steps are involved. The OS abstracts all of this away.

[^5]: Or a switch, or an access point — many possibilities, but eventually a router is involved.

[^6]: They may also record where the message came from so they can forward the reply back along the same path.

[^7]: On macOS, you can use `nc -v example.org 80` instead of `telnet`. On Linux, install `telnet` or `netcat` from your package manager.

[^8]: Other HTTP methods include `POST` (send data to the server), `PUT`, `DELETE`, and more. `GET` is the most common.

[^9]: There are several versions of HTTP: 0.9, 1.0, 1.1, 2.0, and 3.0. HTTP 1.1 adds keep-alive and other features; HTTP 2.0 and 3.0 are binary protocols designed for performance in complex web applications.

[^10]: This is critical because the same IP address often hosts multiple websites (e.g., `example.com` and `example.org`). The `Host` header tells the server which one you want.

[^11]: HTTP is a "line-based protocol" — plain text with newlines — much like SMTP for email. This simplicity traces back to early computers that only had line-based text input.

[^12]: The status text (like `OK` or `Not Found`) is for humans; machines use the numeric code.

[^13]: More precisely, who the *server* thinks is at fault. A full list of status codes is available [on Wikipedia](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes).

[^14]: Newer versions of HTTP use a protocol called QUIC instead of TCP, but the basic principle of sockets is the same.

[^15]: Computers are endlessly literal-minded.

[^16]: TLS is quite complex under the hood (see [RFC 8446](https://tools.ietf.org/html/rfc8446)). Implementing your own TLS is not recommended — it's very difficult to do securely.

[^17]: This is a testament to HTML's design: even at the most basic level, it's possible to parse, and the first browsers were not much more sophisticated than this.

[^18]: HTML, URLs, and HTTP were all designed by Tim Berners-Lee and others at CERN in 1989–1990. The first web browser (called WorldWideWeb) and first web server (`httpd`) were born then. On December 20, 1990, the [first web page](http://info.cern.ch/hypertext/WWW/TheProject.html) went live.

