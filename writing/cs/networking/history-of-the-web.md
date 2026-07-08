---
order: 1
---
# History of the Web

This chapter explores the origins of the web: how it began, and how both the web and browsers have changed over time. The account is not complete;[^1] it concentrates on the pivotal events and concepts that gave rise to the web, along with the intentions and ambitions of the people who created it.

[^1]: For example, there is nothing much about Standard Generalized Markup Language (SGML) or other predecessors to HTML. (Except in this footnote!)

## The Memex Concept

[image-place-holder]

*Figure 1: The original publication of "As We May Think". (Dunkoman from Wikipedia, CC BY 2.0.)*

A landmark early vision of how computers could transform information is Vannevar Bush's 1945 essay "[As We May Think](https://en.wikipedia.org/wiki/As_We_May_Think)." The essay described a device he called the [memex](https://en.wikipedia.org/wiki/Memex) — a machine that would let a single person view and navigate all the world's information (see Figure 1). Bush framed it using the microfilm screen technology of his era, but its core purpose and idea bear striking resemblance to today's web, even though the interface and technical specifics are different.

At its heart, the web revolves around a Memex-like mission: *representing and displaying information* so that humans can effectively learn and explore. The accumulated knowledge and wisdom of humanity surpassed the limits of any one mind, institution, library, nation, culture, group, or language long ago. Yet even though we as individuals can grasp only a sliver of what exists to be known, technology lets us learn far more efficiently — and, *crucially*, to rapidly retrieve information we need to learn, remember, or recall. Consider the imaginary research session Bush described, which feels remarkably close to how we sometimes use the web today:

> The owner of the memex, let us say, is interested in the origin and properties of the bow and arrow. \[…\] He has dozens of possibly pertinent books and articles in his memex. First he runs through an encyclopedia, finds an interesting but sketchy article, leaves it projected. Next, in a history, he finds another pertinent item, and ties the two together. Thus he goes, building a trail of many items.

Computers — and the internet — give us the power to *process and store* information. But it is *the web* that lets us *organize and find* that information, turning it into usable knowledge.[^2]

[^2]: Google's well-known mission statement to "organize the world's information and make it universally accessible and useful" is almost exactly the same. This is not a coincidence—the search engine concept is inherently connected to the web, and was inspired by the design of the web and its antecedents.

"As We May Think" called out two memex features: looking up information records, and creating associations between related records. The essay placed particular weight on the second — Bush argued we learn by forging previously unknown *connections between things we already know*:

> When data of any sort are placed in storage, they are filed alphabetically or numerically. \[…\] The human mind does not work that way. It operates by association.

By "association," Bush meant a trail of thought connecting one record to the next through a link curated by a person. He imagined not merely a universal library, but a universal method for recording the outcomes of our learning.

## The Web Emerges

The idea of [hypertext](https://en.wikipedia.org/wiki/Hypertext) — documents connected by [hyperlinks](https://en.wikipedia.org/wiki/Hyperlink#History) — was created in 1964–65 by [Project Xanadu](https://en.wikipedia.org/wiki/Project_Xanadu), under Ted Nelson's leadership.[^3] Hypertext is simply text that contains hyperlinks pointing to other text.[^4] A web page is hypertext, and the links between pages are hyperlinks. The language for writing web pages is HTML and the protocol for fetching them is HTTP — both names include "HyperText." Figure 2 shows the early Hypertext Editing System in action.

[^3]: He was inspired by the long tradition of citation and criticism in academic and literary communities. The Project Xanadu research papers were heavily motivated by this use case.

[^4]: A successor called the Hypertext Editing System was the first to introduce the back button, which all browsers now have. Since the system only had text, the "button" was itself text. Sound familiar?

[image-place-holder]

*Figure 2: A computer operator using the Hypertext Editing System in 1969. (Gregory Lloyd from Wikipedia, CC BY-SA 4.0 International.)*

Separately from Project Xanadu, the earliest hyperlink system appeared for scrolling within a single document; it was later extended to link across multiple documents. And much like those original systems, the web supports linking within documents as well as between them. For example, the URL `http://browser.engineering/history.html#the-web-emerges` points to a document called "`history.html`" and, within it, the element named "`the-web-emerges`": this very section. Visiting that URL loads this chapter and scrolls directly to this section.

This body of work also shaped and inspired one of the central pieces of Douglas Engelbart's [mother of all demos](https://en.wikipedia.org/wiki/The_Mother_of_All_Demos) — arguably the single most influential technology demonstration in computing history (see Figure 3). That demo not only showcased the core concepts behind the web, but also debuted the computer mouse and graphical user interface, both of which are essential to a browser's UI.[^5]

[^5]: That demo went beyond even this. There are some parts of it that have not yet been realized in any computer system. Watch it!

[image-place-holder]

*Figure 3: Doug Engelbart presenting the mother of all demos. (SRI International, via the Doug Engelbart Institute.)*

There is, of course, a very direct line from this research to the document–URL–hyperlink model of the web, which took the hypertext concept and put it into practice. The [HyperTIES](http://www.cs.umd.edu/hcil/hyperties/) system, for instance, featured highlighted hyperlinks and was used to produce the first-ever electronically published academic journal: the 1988 issue of the [*Communications of the ACM*](https://cacm.acm.org/). Tim Berners-Lee has cited that 1988 issue as a source of inspiration for the World Wide Web,[^6] in which he combined the idea of linking with the reach of the internet, thereby fulfilling many of the original goals set out by decades of prior work.[^7]

[^6]: Nowadays the World Wide Web is called just "the web", or "the web ecosystem"—ecosystem being another way to capture the same concept as "World Wide". The original wording lives on in the "www" in many website domain names.

[^7]: Just as the web itself is a realization of previous ambitions and dreams, today we strive to realize the vision laid out by the web. (No, it's not done yet!)

The term "hyperlink" may have been coined in 1987, in connection with Apple's [HyperCard](https://en.wikipedia.org/wiki/HyperCard) system. HyperCard was also among the first — perhaps the very first — to introduce the notion of enriching hypertext with scripts that respond to user events like clicks and perform actions that enhance the UI — exactly like JavaScript on a web page! Unlike most of its predecessors, it also offered graphical UI elements, not just text.

In 1989–1990, Tim Berners-Lee wrote the first web browser (called WorldWideWeb, see Figure 4) and the first web server (named `httpd`, short for HTTP Daemon, following UNIX naming conventions). Interestingly, while that browser's feature set was in some respects narrower than the browser you'll build in this book,[^8] in other ways it exceeded what even modern browsers can do.[^9] The [first web page](http://info.cern.ch/hypertext/WWW/TheProject.html) went live on December 20, 1990. The browser we'll implement in this book can render that page without trouble, even today.[^10] In 1991, Berners-Lee promoted his browser and the broader concept on the [`alt.hypertext` Usenet group](https://www.w3.org/People/Berners-Lee/1991/08/art-6484.txt).

[^8]: No CSS! No JS! Not even images!

[^9]: For example, the first browser included the concept of an index page meant for searching within a site (vestiges of which exist today in the "index.html" convention when a URL path ends in `/`), and had a WYSIWYG web page editor (the `contenteditable` HTML attribute on DOM elements has similar semantic behavior, but built-in file saving is gone). Today, the index is replaced with a search engine, and web page editors as a concept are somewhat obsolete due to the highly dynamic nature of today's web page rendering.

[^10]: Also, as you can see clearly, that web page has not been updated in the meantime, and retains its original aesthetics!

[image-place-holder]

*Figure 4: Screenshot of the WorldWideWeb browser. (Communications of the ACM, August 1994.)*

Berners-Lee's [Brief History of the Web](https://www.w3.org/DesignIssues/TimBook-old/History.html) calls out several other factors that turned the World Wide Web into the web we recognize today. One critical factor was its decentralized nature, which he attributes to the academic culture at [CERN](https://home.cern/), where he was employed. Decentralization is a defining characteristic that sets the web apart from many systems that preceded or followed it, and his explanation deserves to be quoted directly (the italics are mine):

> There was clearly a need for something like Enquire[^11] but accessible to everyone. I wanted it to scale so that if two people started to use it independently, and later started to work together, *they could start linking together their information without making any other changes*. This was the concept of the web.

[^11]: Enquire was a predecessor web-like database system, also written by Berners-Lee.

This quote captures one of the key value propositions of the web: its decentralized nature. The web was successful for several reasons, but they all had to do with decentralization:

- Because there was no gatekeeper to doing anything, it was easy for anyone, even novices, to make simple web pages and publish them.

- Because pages were identified simply by URLs, traffic could come to the web from outside sources like email, social networking, and search engines. Further, compatibility between sites and the power of hyperlinks created [network effects](https://en.wikipedia.org/wiki/Network_effect) that further strengthened the effect of hyperlinks from *within* the web.

- Because the web was outside the control of any one entity—and kept that way via standards organizations—it avoided the problems of monopoly control and manipulation.

## Browsers

The first *widely distributed* browser may have been [ViolaWWW](https://en.wikipedia.org/wiki/ViolaWWW) (see Figure 5); it also pioneered several interesting features like applets and images. ViolaWWW in turn inspired [NCSA Mosaic](https://en.wikipedia.org/wiki/Mosaic_\(web_browser\)) (see Figure 6), which launched in 1993. One of Mosaic's two original authors went on to co-found Netscape, which built [Netscape Navigator](https://en.wikipedia.org/wiki/Netscape_Navigator) (see Figure 7), the first *commercial browser*,[^12] released in 1994. [Feeling threatened](https://lettersofnote.com/2011/07/22/the-internet-tidal-wave/), Microsoft launched Internet Explorer (see Figure 8) in 1995 and soon began bundling it with Windows 95.

[^12]: By commercial I mean built by a for-profit entity. Netscape's early versions were also not free software—you had to buy them from a store. They cost about $50.

[image-place-holder]

*Figure 5: ViolaWWW. (Viola in a Nutshell.)*

[image-place-holder]

*Figure 6: Mosaic. (Wikipedia, CC0 1.0.)*

[image-place-holder]

*Figure 7: Netscape Navigator 1.22. (Wikipedia.)*

[image-place-holder]

*Figure 8: Internet Explorer 1.0. (Wikipedia, used with permission from Microsoft.)*

What followed was the era of the ["first browser war"](https://en.wikipedia.org/wiki/Browser_wars#First_Browser_War_\(1995%E2%80%932001\)): a rivalry between Netscape Navigator and [Internet Explorer](https://en.wikipedia.org/wiki/Internet_Explorer). Other browsers held smaller market shares; [Opera](https://en.wikipedia.org/wiki/Opera_\(web_browser\)) is one notable example. The [KHTML](https://en.wikipedia.org/wiki/KHTML) project began in 1999; [Safari](https://en.wikipedia.org/wiki/Safari_\(web_browser\)) and [Chromium](https://www.chromium.org/)-based browsers — including Chrome and newer versions of [Edge](https://en.wikipedia.org/wiki/Microsoft_Edge) — trace back to this codebase. Meanwhile, Netscape started developing the [Gecko](https://en.wikipedia.org/wiki/Gecko_\(software\)) rendering engine in 1997; the [Firefox](https://en.wikipedia.org/wiki/Firefox) browser descends from that codebase. During the first browser war, nearly all of the core features our simple browser will implement were introduced, including CSS, DOM, and JavaScript.

The "second browser war" — which Wikipedia places in [2004–2017](https://en.wikipedia.org/wiki/Browser_wars#Second_Browser_War_\(2004%E2%80%932017\)) — pitted several browsers against each other, most notably Internet Explorer, Firefox, Safari, and Chrome. Safari and Chrome initially shared the same rendering engine, but Chrome forked to create [Blink](https://en.wikipedia.org/wiki/Blink_\(browser_engine\)) in 2013, which Microsoft Edge adopted by 2020. The second browser war produced many features of the modern web: widespread adoption of AJAX,[^13] HTML5 capabilities like `<canvas>`, and an explosive growth of third-party JavaScript libraries and frameworks.

[^13]: Asynchronous JavaScript and XML, where XML stands for eXtensible Markup Language.

## Web Standards

Running alongside these developments was another thread of equal importance — the standardization of web APIs. In October 1994, the [World Wide Web Consortium](https://www.w3.org/Consortium/facts) (W3C) was established to provide governance and standards for web features. Before this, browsers would often debut new HTML elements or APIs, and rival browsers would be forced to replicate them. With a standards body in place, those elements and APIs could instead be negotiated and formally documented in specifications. (Today, an initial discussion, design phase, and specification typically precede any new feature.) Later, the HTML specification moved to a different standards body called the [WHATWG](https://whatwg.org/), though [CSS](https://drafts.csswg.org/) and other features remain under the W3C. JavaScript is standardized at yet another body, TC39 ([Technical Committee 39](https://tc39.es/)) within [ECMA](https://www.ecma-international.org/about-ecma/history/). [HTTP](https://tools.ietf.org/html/rfc2616) is standardized by the [IETF](https://www.ietf.org/about/). The key takeaway is that the standards framework established in the mid-1990s is still with us.

In the web's early years, it was far from obvious that browsers would remain standards-compliant and that a single browser might not "win" and turn into another proprietary software platform. Several factors prevented this: the egalitarian spirit of the computing community, the existence and influence of the W3C, and — importantly — the networked character of the web itself. Because web developers needed their pages to function correctly across most or all browsers (or risk losing users), they avoided proprietary extensions. Conversely, browsers invested great effort in carefully reproducing each other's undocumented behaviors — including bugs — to ensure they continued supporting the entire web.

There was never truly a moment when any browser openly tried to abandon the standard, despite ongoing fears that it could happen.[^14] Instead, fierce competition for market share was channeled into rapid innovation and a continuously expanding set of APIs and capabilities, which we now call *the web platform* rather than simply the "World Wide Web." This shift in terminology acknowledges that the web has moved beyond being a document-viewing mechanism and has matured into a full computing platform and ecosystem.[^15]

[^14]: Perhaps the closest the web came to fragmenting was with the late-1990s introduction of features for DHTML—early versions of the Document Object Model you'll learn about in this book. Netscape and Internet Explorer at first had incompatible implementations of these features, and it took years, the development of a common specification, and significant pressure campaigns on the browsers before standardization was achieved. You can read about this story in much more depth from Jay Hoffman.

[^15]: There have even been operating systems built around the web! Examples include webOS, which powered some Palm smartphones, Firefox OS (that today lives on in KaiOS-based phones), and ChromeOS, which is a desktop operating system. All of these operating systems are based on using the web as the UI layer for all applications, with some JavaScript-exposed APIs on top for system integration.

Looking at the results — multiple competing browsers and mature standards — it's clear in hindsight that which browser "won" or "lost" each "war" matters less than the fact that *the web* itself won, gaining users and expanding in capability.

## Open Source

Another significant and interesting outcome of the *second* browser war is that all mainstream browsers today[^16] rest on *three open-source web rendering / JavaScript engines*: Chromium, Gecko, and WebKit.[^17] Since Chromium and WebKit share a common ancestor, while Gecko is an open-source descendant of Netscape, all three trace their roots back to the 1990s — nearly to the web's very beginning.

[^16]: Examples of Chromium-based browsers include Chrome, Edge, Opera (which switched to Chromium from the Presto engine in 2013), Samsung Internet, Yandex Browser, UC Browser, and Brave. In addition, there are many "embedded" browsers, based on one or another of the three engines, for a wide variety of automobiles, phones, TVs, and other electronic devices.

[^17]: The JavaScript engines are actually in different repositories (as are various other subcomponents), and can and do get used outside the browser as JavaScript virtual machines. One important application is the use of V8 to power node.js. However, each of the three rendering engines does have a corresponding JavaScript implementation, so conflating the two is reasonable.

This is no accident. In fact, it reveals something quite interesting about the most cost-effective way to build a rendering engine atop a commodity set of platform APIs. For example, it's common for independent developers — not paid by the company nominally controlling the browser — to contribute code and features. There are even companies and individuals that specialize in implementing browser features! It's also common for features in one browser to copy code from another. And the fact that every major browser is open source feeds back into the standards process, further reinforcing the web's decentralized nature.

## Summary

To recap, here's how the history unfolded:

1. Foundational research explored ways to represent and explore information.
2. Once the underlying technology matured enough, the web itself was proposed and built.
3. The web caught on rapidly, and many browsers emerged to seize the opportunity it created.
4. Standards organizations formed to mediate between browsers and prevent proprietary lock-in.
5. Competition between browsers drove rapid increases in their power and complexity.
6. Browsers spread to every device and operating system — desktop, mobile, and embedded.
7. Ultimately, all web rendering engines became open source, acknowledging that they represent a shared endeavor larger than any single entity.

The web has come a long way! But one thing seems clear: it isn't done yet.

