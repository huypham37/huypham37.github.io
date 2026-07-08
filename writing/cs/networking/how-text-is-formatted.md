---
order: 4
---
# How Text Is Formatted

A browser that only draws monospaced characters in a grid works fine for Chinese, but English text has letters of varying widths arranged into words that can't be split across lines.[^1] This article walks through how a browser measures, lays out, and styles text — from fonts and baselines to bold, italic, and mixed sizes.

## What Is a Font?

In the days of the printing press, printers laid out small metal slugs on rails, coated them with ink, and pressed them to paper. The metal shapes came in boxes — one per letter — stored in cases: an upper *case* and a lower *case*. The set of cases was called a **font**.[^2] If you wanted larger text, you needed different (bigger) shapes — a different font. A collection of fonts was called a *type*, which is why we call it "typing." Variations like bold or italic were known as that type's "faces."

[image-place-holder]

*Figure 1: A drawing of printing press workers. (Daniel Nikolaus Chodowiecki, public domain.)*

[image-place-holder]

*Figure 2: Metal types in letter cases and a composing stick. (Willi Heidelbach, CC BY 2.5.)*

Modern computers dispensed with the metal, but kept — and confused — the words. "Font" can now mean font, typeface, or type.[^3] A font contains several different **weights** (like "bold" and "normal"),[^4] several different **styles** (like "italic" and "roman"),[^5] and arbitrary **sizes**.[^6]

In code, a font object bundles a type at a fixed size, style, and weight:

```python
import tkinter.font

bi_times = tkinter.font.Font(
    family="Times",
    size=16,
    weight="bold",
    slant="italic",
)
```

You can then pass that font to text-drawing calls:

```python
canvas.create_text(200, 100, text="Hi!", font=bi_times)
```

## Measuring Text

Text takes up space both vertically and horizontally. A font object provides two key methods for measuring that space.

### Vertical Metrics

The `metrics()` method returns the font's vertical dimensions:

```
>>> bi_times.metrics()
{'ascent': 15, 'descent': 4, 'linespace': 19, 'fixed': 0}
```

These values describe how tall the text is (see Figure 3):

- **linespace**: the total height of a line of text
- **ascent**: the portion above the baseline
- **descent**: the portion below the baseline

[image-place-holder]

*Figure 3: The vertical metrics of a font. All glyphs share the same ascent, x-height, and descent, and are laid out on a shared baseline. The measure (advance) of individual glyphs can differ.*

A size of 16 means 16 *points*, defined as 72nds of an inch — not 16 *pixels*.[^7] Those 16 points measure the metal blocks the letters were once carved from, so the letters themselves are smaller than 16 points. Different size-16 fonts have letters of varying heights:

```
>>> tkinter.font.Font(family="Courier", size=16).metrics()
{'ascent': 13, 'descent': 4, 'linespace': 17}
>>> tkinter.font.Font(family="Times", size=16).metrics()
{'ascent': 14, 'descent': 4, 'linespace': 18}
>>> tkinter.font.Font(family="Helvetica", size=16).metrics()
{'ascent': 15, 'descent': 4, 'linespace': 19}
```

### Horizontal Measurement

The `measure()` method tells you how much horizontal space a piece of text takes up, in pixels. This varies by letter:

```
>>> bi_times.measure("Hi!")
24
>>> bi_times.measure("H")
13
>>> bi_times.measure("i")
5
>>> bi_times.measure("!")
7
```

Note that the sum of individual letters (13 + 5 + 7 = 25) doesn't equal the word measurement (24). Tk uses fractional pixels internally and rounds up; some fonts also apply **kerning** — subtle shifts between specific letter pairs — or **shaping** to merge two letters into one glyph.[^8]

Armed with measurements, you can position text precisely. For example, drawing "Hello, " in roman and "world!" in italic, correctly aligned:

```python
x, y = 200, 200
canvas.create_text(x, y, text="Hello, ", font=font1, anchor='nw')
x += font1.measure("Hello, ")
canvas.create_text(x, y, text="world!", font=font2, anchor='nw')
```

The `anchor='nw'` argument tells the drawing system to treat the given coordinates as the top-left ("northwest") corner, rather than the default center — which matters when pieces of text have different widths.[^9]

## Word by Word

In Chinese, each character is roughly a word, so laying out character by character works. In English, you can't break a line in the middle of a word. Instead, we lay out text one **word** at a time:

```python
def layout(text):
    font = tkinter.font.Font()
    for word in text.split():
        w = font.measure(word)
        if cursor_x + w > WIDTH - HSTEP:
            cursor_y += font.metrics("linespace") * 1.25
            cursor_x = HSTEP
        display_list.append((cursor_x, cursor_y, word))
        cursor_x += w + font.measure(" ")
```

The key logic: if the word would extend past the right edge of the page (`cursor_x + w > WIDTH`), we wrap to the next line. After placing the word, `cursor_x` advances by the word width plus a space.

The line spacing is multiplied by 1.25. Without that extra 25%, the lines feel too "tight" and become hard to read. This practice is called **leading**[^10] — adding space between lines to improve legibility.

## Styling Text

Web pages mark up text with tags like `<b>` for bold and `<i>` for italic. To support this, the browser needs to know where those tags appear. Instead of passing raw text to the layout engine, we first **tokenize** the HTML into `Text` objects (runs of characters) and `Tag` objects (the contents of angle brackets):

```python
def lex(body):
    out = []
    buffer = ""
    in_tag = False
    for c in body:
        if c == "<":
            in_tag = True
            if buffer: out.append(Text(buffer))
            buffer = ""
        elif c == ">":
            in_tag = False
            out.append(Tag(buffer))
            buffer = ""
        else:
            buffer += c
    if not in_tag and buffer:
        out.append(Text(buffer))
    return out
```

The layout engine can then inspect tags and adjust the font accordingly:

```python
weight = "normal"
style = "roman"

for tok in tokens:
    if isinstance(tok, Text):
        for word in tok.text.split():
            font = tkinter.font.Font(
                size=16,
                weight=weight,
                slant=style,
            )
            # ... measure and place the word ...
    elif tok.tag == "i":
        style = "italic"
    elif tok.tag == "/i":
        style = "roman"
    elif tok.tag == "b":
        weight = "bold"
    elif tok.tag == "/b":
        weight = "normal"
```

This correctly handles `<b>bold</b>`, `<i>italic</i>`, and even `<b><i>bold italic</i></b>` text.[^11]

*Italic* fonts were developed in Italy (hence the name) to mimic a cursive handwriting style called "chancery hand." Non-italic fonts are called *roman* because they mimic text on Roman monuments.[^12]

## Aligning Text on a Baseline

When you mix font sizes, a naive approach aligns text along its top — like it's hanging from a clothesline. But English text aligns along an invisible **baseline** instead. Fixing this requires a **two-pass** algorithm:

1. **First pass**: gather all words that fit on the current line, computing their x positions.
2. **Second pass**: compute the line's baseline from the maximum ascent, then vertically position each word relative to that baseline.

[image-place-holder]

*Figure 4: How lines are laid out with multiple fonts. All words share a baseline. The line's ascent and descent are determined by the maximum across all words.*

The first pass buffers words into a line:

```python
class Layout:
    def word(self, word):
        font = get_font(self.size, self.weight, self.style)
        w = font.measure(word)
        if self.cursor_x + w > WIDTH - HSTEP:
            self.flush()
        self.line.append((self.cursor_x, word, font))
        self.cursor_x += w + font.measure(" ")
```

The `flush` method implements the second pass — computing the baseline and positioning each word:

```python
def flush(self):
    if not self.line: return
    metrics = [font.metrics() for x, word, font in self.line]
    max_ascent = max(m["ascent"] for m in metrics)

    baseline = self.cursor_y + 1.25 * max_ascent

    for x, word, font in self.line:
        y = baseline - font.metrics("ascent")
        self.display_list.append((x, y, word, font))

    max_descent = max(m["descent"] for m in metrics)
    self.cursor_y = baseline + 1.25 * max_descent
    self.cursor_x = HSTEP
    self.line = []
```

Words are positioned so their ascents touch the baseline. The line's height is determined by the tallest word's descent below that baseline. This two-pass design also makes it easy to support line-breaking tags like `<br>` and paragraph tags like `<p>`/`</p>`.

## Font Caching

On a large web page, some words appear hundreds of times (the word "the" shows up over 200 times in a typical chapter). Measuring each occurrence from scratch is wasteful — text measurement is one of the slowest parts of rendering.[^13]

The solution is caching: create each `Font` object once and reuse it for identical size/weight/style combinations:

```python
FONTS = {}

def get_font(size, weight, style):
    key = (size, weight, style)
    if key not in FONTS:
        font = tkinter.font.Font(size=size, weight=weight, slant=style)
        label = tkinter.Label(font=font)
        FONTS[key] = (font, label)
    return FONTS[key][0]
```

Now identical words use the same font object, and the text library's built-in measurement caches become effective. On normal English text, this yields a substantial speedup.[^14]

Font caching is especially critical for scripts like Chinese, where font files can be megabytes in size and are loaded from disk on demand. Modern browsers maintain extensive caches for measuring, shaping, and rendering text — these caches are among the most important performance optimizations in a rendering engine.

## Summary

A browser's text layout engine transforms raw HTML into positioned, styled glyphs on screen through a series of steps:

- **Tokenize** the HTML into text runs and tags.
- **Select fonts** based on current weight (bold/normal), style (italic/roman), and size.
- **Measure** each word's width using the selected font.
- **Wrap** words onto lines when they exceed the page width.
- **Align** words on a shared baseline, computing vertical offsets from ascents and descents.
- **Cache** font objects to avoid redundant measurement.

This is just the beginning of typography. Real browsers also handle hyphenation, justification, right-to-left scripts, vertical writing systems, and the full complexity of CSS.[^15] But even this simple engine can render a chapter of a book — and that's where we'll stop.

---

[^1]: Real browsers support every language from Arabic to Zulu, but this article focuses on English for brevity. Text is near-infinitely complex!

[^2]: The word is related to *foundry*, which created the little metal shapes.

[^3]: Let alone "font family," which can refer to larger or smaller collections of types. Welcome to the world of magic ink — a term from [Bret Victor's essay](http://worrydream.com/MagicInk/) about the graphical possibilities of computers.

[^4]: Good fonts also come in "light," "semibold," "black," and "condensed."

[^5]: Sometimes there's also an "oblique" option (roman letters that are slanted), and small-caps variants.

[^6]: A font looks especially good at certain sizes where *hints* tell the computer how best to align it to the pixel grid.

[^7]: The definition of a "point" is historically a mess, with many different length units called "point" around the world. The 1/72 standard comes from PostScript. TeX, for example, uses approximately 1/72.27 of an inch.

[^8]: In 2012, the Michigan Supreme Court heard *Stand Up for Democracy v. Secretary of State*, a case about a ballot referendum's validity that hinged on the definition of font size. The court ruled (correctly) that font size measures the metal blocks, not the letters themselves.

[^9]: This bug is masked when the two pieces of text happen to have the same width. "Hello, " and "world!" are the same length; "Hello, " and "overlapping!" are not.

[^10]: Pronounced "led-ing" not "leed-ing." In metal type days, thin pieces of lead were placed between lines to space them out. Lead is softer than the metal used for letters, so it could compress to keep pressure on the other pieces.

[^11]: It even handles incorrectly nested tags like `<b>b<i>bi</b>i</i>`, but not `<b><b>twice</b>bolded</b>` — that requires a more sophisticated state stack, which real browsers implement.

[^12]: There is an obscure third option: oblique fonts, which are roman fonts that are simply slanted.

[^13]: You can profile Python programs with `python3 -m cProfile`. Look for `measure` and `metrics` calls to see how much time is spent on text measurement.

[^14]: On macOS, the operating system's "Core Text" APIs already cache fonts aggressively, so the improvement is less dramatic than on Linux or Windows.

[^15]: Browsers also support vertical writing systems (like traditional East Asian styles) and complex scripts like Mongolian, which runs top to bottom, left to right.

