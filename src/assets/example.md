# h1 Heading :grinning:
Hello :grinning:

---
# Style support
<style>
img
{max-width: 50% !important;}
h1{color: #666 !important;}
.markdown-body details {
    border: dashed;
    padding: 1em;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    background-color: #ffd699;
}

.markdown-body details summary {
    cursor: pointer;
    outline: none;
}

.markdown-body details summary:active, .markdown-body details summary:focus {
    outline: none;
    border: none;
}
</style>

# Details html support

<details>
<summary>Summary</summary>
Details content
</details>
<details open>
<summary>Summary when details is open</summary>
Details content
</details>

#> Summary when use markdown
Content
#

#>> Summary when use markdown and open
Content
#

# Inline style in block style

> This is quote, and [this is a link](https://github.com)

> This is quote, and [this is a link](https://github.com), and this is an emoji :joy:

# Block style in block style

> # Heading style in quote
> here is content

## Images

![Minion](https://octodex.github.com/images/minion.png)
![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")