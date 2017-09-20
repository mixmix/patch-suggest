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

  function suggestedChannels () {
    loadSuggestions()
    return function (word) {
      if (!word) {
        return suggestions().slice(0, 100)
      }

      word = word.toLowerCase()
      return suggestions()
        .filter(item => ~item.title.toLowerCase().indexOf(word))
    }
  }

  function loadSuggestions () {
    if (!suggestions) {
      var id = api.keys.sync.id()
      subscribed = api.channel.obs.subscribed(id)
      var recentlyUpdated = api.channel.obs.recent()
      var contacts = computed([subscribed, recentlyUpdated], function (a, b) {
        var result = Array.from(a)
        b.forEach((item, i) => {
          if (!result.includes(item)) {
            result.push(item)
          }
        })
        return result
      })

      suggestions = map(contacts, suggestion, {idle: true})
      watch(suggestions)
    }
  }

  function suggestion (id) {
    return Struct({
      title: id,
      id: `#${id}`,
      subtitle: computed([id, subscribed], subscribedCaption),
      value: computed([id], mention)
    })
  }
}

function subscribedCaption (id, subscribed) {
  if (subscribed.has(id)) {
    return 'subscribed'
  }
}

function mention (id) {
  return `[#${id}](#${id})`
}

