const nest = require('depnest')
const { computed, watch, map, Struct } = require('mutant')

exports.gives = nest('channel.async.suggest')

exports.needs = nest({
  'channel.obs': {
    recent: 'first',
    subscribed: 'first'
  },
  'keys.sync.id': 'first'
})

exports.create = function (api) {
  var suggestions = null
  var subscribed = null

  return nest('channel.async.suggest', suggestedChannels)

  function suggestedChannels (word, cb) {
    loadSuggestions()
    if (word === null) return

    if (!word) {
      return suggestions()
        .sort(() => Math.random() > 0.5 ? +1 : -1) // shuffle
        .slice(0, 100)
    }

    const wordNormed = normalise(word)

    const results = suggestions()
      .filter(item => ~normalise(item.title).indexOf(word))
      .sort((a, b) => {
        // where name is is an exact match
        if (a.title === word) return -1
        if (b.title === word) return +1

        // TODO - move all this into the suggestion building and decorate the suggestion?
        const normedATitle = normalise(a.title)
        const normedBTitle = normalise(b.title)

        // where normalised name is an exact match
        if (normedATitle === wordNormed) return -1
        if (normedBTitle === wordNormed) return +1

        // where name is matching exactly so far
        if (a.title.indexOf(word) === 0) return -1
        if (b.title.indexOf(word) === 0) return +1

        // where name is matching exactly so far (case insensitive)
        if (normedATitle.indexOf(wordNormed) === 0) return -1
        if (normedBTitle.indexOf(wordNormed) === 0) return +1
      })
    cb(null, results)
  }

  function loadSuggestions () {
    if (suggestions) return

    var id = api.keys.sync.id()
    subscribed = api.channel.obs.subscribed(id)
    var recentlyUpdated = api.channel.obs.recent()
    var channels = computed([subscribed, recentlyUpdated], function (a, b) {
      var result = Array.from(a)
      b.forEach((item, i) => {
        if (!result.includes(item)) {
          result.push(item)
        }
      })
      return result
    })

    suggestions = map(channels, suggestion, {idle: true})
    watch(suggestions)
  }

  function suggestion (id) {
    return Struct({
      title: id,
      id: `#${id}`,
      subtitle: computed([id, subscribed], subscribedCaption),
      value: `#${id}`
    })
  }
}

function subscribedCaption (id, subscribed) {
  if (subscribed.has(id)) {
    return 'subscribed'
  }
}

function normalise (word) {
  return word.toLowerCase() //.replace(/(\s|-)/g, '')
}
