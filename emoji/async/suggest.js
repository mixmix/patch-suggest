const nest = require('depnest')

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
      if (word[word.length - 1] === ':') {
        word = word.slice(0, -1)
      }
      word = word.toLowerCase()
      // TODO: when no emoji typed, list some default ones

      return api.emoji.sync.names()
        .filter(name => ~name.indexOf(word))
        .slice(0, 100).map(emoji => {
          return {
            image: api.emoji.sync.url(emoji),
            title: emoji,
            subtitle: emoji,
            value: ':' + emoji + ':'
          }
        })
    }
  }
}

