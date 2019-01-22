# Patch-suggest

A module for easy suggest-mentions of people / channels / emoji in patch-\* family apps.

**NOTE** : requires `ssb-suggest` plugin installed in your `ssb-server`

Provides suggestions and styles in a format consumed by [`suggest-box`](https://github.com/pfrazee/suggest-box)

You'll need to understand [depject](https://github.com/depject/depject) (a module for a different way of managing dependency injection), and for the example below, [depnest](https://github.com/depject/depnest) - a lazy way to write nested objects quickly.


## Example


```js
const nest = require('depnest')
const { h } = require('mutant')
const suggestBox = require('suggest-box')

exports.gives = nest('app.page.somePage')

exports.needs = nest({
  'about.async.suggest': 'first',
  'channel.async.suggest': 'first',
  'emoji.async.suggest': 'first',
  'meme.async.suggest': 'first',   // requires sbot has ssb-meme plugin
})

exports.create = (api) => {
  return nest('app.page.somePage', page)

  function page (location) {

    var textArea = h('textarea')
    var feedIdsInThread = [ ... ] // some collection of feeds you'd like to ensure make the suggestions

    suggestBox(
      textArea,
      (inputText, cb) => {
        const char = inputText[0]
        const wordFragment = inputText.slice(1)

        if (char === '@') api.about.async.suggest(wordFragment, feedIdsInThread, cb)
        if (char === '#') api.channel.async.suggest(wordFragment, cb)
        if (char === ':') api.emoji.async.suggest(wordFragment, cb)
        if (char === '&') api.meme.async.suggest(wordFragment, cb)
      },
      {cls: 'PatchSuggest'}
    )

    //...
  }
}
```

## API

Each of these depject methods is called to initialize it (starts pre-loading data in the pbackground) and returns a "suggester".
The suggester functions return "suggestion" objects which are compatible with the `suggest-box` module, but you can use them for whatever!

### `api.about.async.suggest(word, extraIds, cb)

`word` - name, or the start of a name you're searching for 

`extraIds` (optional) you can add an _Array_ (or _MutantArray_) of FeedIds which you would like included in the suggestions. This is a great way to add the context (i.e. the people in the conversation) of a the current page you're in to the suggestions.

### `api.channel.async.suggest(word, cb)

`word` - channel, or the start of a channel you're searching for 

### `api.emoji.async.suggest(word, cb)

`word` - emoji, or the start of a emoji you're searching for 

### `api.meme.async.suggest(word, cb)

`word` - image name, or some part of an image name you're searching for
  - image name is split into searchable parts of characters `_-~. `

Requires the plugin ssb-meme to be installed

## Styling

To use the styles provided by patch-suggest (recommended), supply the options argument to suggest-box `{cls: 'PatchSuggest}` (see example above)

