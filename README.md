# Patch-suggest

A module for easy suggest-mentions of people / channels / emoji in patch-* family apps.

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
  'emoji.async.suggest': 'first',  // NOTE emoji suggestion is synchronous
})

exports.create = (api) => {
  return nest('app.page.somePage', page)

  function page (location) {

    var textArea = h('textarea')

    var getProfileSuggestions = api.about.async.suggest()
    var getChannelSuggestions = api.channel.async.suggest()
    var getEmojiSuggestions = api.emoji.async.suggest()

    suggestBox(
      textArea,
      (inputText, cb) => {
        const char = inputText[0]
        const wordFragment = inputText.slice(1)

        if (char === '@') cb(null, getProfileSuggestions(wordFragment))
        if (char === '#') cb(null, getChannelSuggestions(wordFragment))
        if (char === ':') cb(null, getEmojiSuggestions(wordFragment))
      },
      {cls: 'PatchSuggest'}
    )

    //...
  }
}
```

## Styling

To use the styles provided by patch-suggest (recommended), supply the options argument to suggest-box `{cls: 'PatchSuggest}` (see example above)

