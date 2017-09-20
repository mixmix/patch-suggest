const nest = require('depnest')
const { h } = require('mutant')

exports.gives = nest('emoji.async.suggest')

exports.needs = nest({
  'emoji.sync.names': 'first',
  'emoji.sync.url': 'first'
})

exports.create = function (api) {
  var suggestions = null
  var subscribed = null

  return nest('emoji.async.suggest', suggestedEmoji)
  
  function suggestedEmoji (word) {
    return function (word) {
      // when no emoji typed, list some default ones
      if (word.length === 0) {
        return api.emoji.sync.names()
          .sort(() => Math.random() > 0.5 ? +1 : -1) //shuffle
          .slice(0, 10)
          .map(toSuggestion)
      }

      if (word[word.length - 1] === ':') {
        word = word.slice(0, -1)
      }
      var word = word.toLowerCase()

      return api.emoji.sync.names()
        .filter(name => ~name.indexOf(word))
        .sort((a, b) => { 
          // if word fragment occurs earlier in name, bump up
          return a.indexOf(word) < b.indexOf(word) ? -1 : +1
        })
        .slice(0, 100)
        .map(toSuggestion)
    }
  }

  function toSuggestion (emoji) {
    return {
      image: api.emoji.sync.url(emoji),
      title: emoji,
      subtitle: h('div.emoji', emoji),
      value: ':' + emoji + ':'
    }
  }
}

