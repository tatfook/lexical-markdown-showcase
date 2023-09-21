# Lexical Markdown Case

## Feature

1. The markdown paragraph and inline break precisely correspond to the lexical structure.
2. Support details syntax, also the details html.
3. Support recursively parse markdown in block style, such as details syntax.
4. Support style tag html.
5. Support emoji parse.

## Online Demo

[lexical-markdown-showcase](https://lexical-markdown-showcase.vercel.app)

# How to use

In production env, you can visit an iframe which src
is [markdown editor](http://localhost:5173/md?is_dev=false&is_editable=true&editable_min_height=280)
> You may need to set the url to the same domain, port, subdomain

```yaml
query:
  is_dev: type is boolean, default is true, the tree view will not be displayed when you set it to false.
  is_editable: type is boolean, default is true, the toolbar will not be displayed when you set it to false, but will display automatically only when you edit it.
  editable_min_height: type is number, default is 150, to display the full toolbar menu, you need to increase the editable height.
```

# How to deploy

See [document](./DEPLOY.md)


# Thanks

- [lexical-vue](https://github.com/wobsoriano/lexical-vue)
- [lexical](https://github.com/facebook/lexical)
- [lexical-markdown-enhance](https://github.com/tatfook/lexical-for-keepwork/packages/lexical-markdown/npm)