const nest = require('depnest')
const { isFeed } = require('ssb-ref')
const { h, Struct, map, concat, dictToCollection, computed, lookup, watch, keys, resolve } = require('mutant')

const KEY_SAMPLE_LENGTH = 10 // includes @

exports.gives = nest('about.async.suggest')

exports.needs = nest({
  'about.obs.groupedValues': 'first',
  'about.obs.name': 'first',
  'about.obs.imageUrl': 'first',
  'contact.obs.following': 'first',
  'contact.obs.followers': 'first',
  'feed.obs.recent': 'first',
  'keys.sync.id': 'first'
})

exports.create = function (api) {
  var suggestions = null
  var recentSuggestions = null

  return nest('about.async.suggest', suggestedProfile)

  function suggestedProfile () {
    loadSuggestions()

    return function (word) {
      if (!word) return recentSuggestions()

      var wordNormed = normalise(word)
      return suggestions()
        .filter(item => ~normalise(item.title).indexOf(wordNormed))
        .sort((a, b) => { 
          // where name is is an exact match
          if (a.title === word) return -1
          if (b.title === word) return +1

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
        .reduce((sofar, match) => {
          // prune down to the first instance of each id
          // this presumes if you were typing e.g. "dino" you don't need "ahdinosaur" as well
          if (sofar.find(el => el.id === match.id)) return sofar

          return [...sofar, match]
        }, [])
        .sort((a, b) => { 
          // bubble up names where typed word matches our name for them
          if (a._isPrefered) return -1
          if (b._isPrefered) return +1
        })
    }
  }

  function loadSuggestions () {
    if (suggestions) return

    var myId = api.keys.sync.id()
    var following = api.contact.obs.following(myId)
    var followers = api.contact.obs.followers(myId)
    var recentlyUpdated = api.feed.obs.recent()
    var contacts = computed([following, followers, recentlyUpdated], (a, b, c) => {
      var result = new Set(a)
      b.forEach(item => result.add(item))
      c.forEach(item => result.add(item))

      return Array.from(result)
    })

    recentSuggestions = map(
      computed(recentlyUpdated, (items) => Array.from(items).slice(0, 10)),
      buildSuggestion,
      {idle: true}
    )

    const suggestionsRecord = lookup(contacts, contact => {
      return [contact, keys(api.about.obs.groupedValues(contact, 'name'))]
    })

    suggestions = concat(
      map(dictToCollection(suggestionsRecord), pluralSuggestions, {idle: true})
    )

    watch(recentSuggestions)
    watch(suggestions)
  }

  function pluralSuggestions (item) {
    const id = resolve(item.key)

    return computed([api.about.obs.name(id)], myNameForThem => {
      return map(item.value, name => { 
        const names = item.value()

        const aliases = names
          .filter(n => n != name)
          .map(name => h('div.alias', 
            { className: name === myNameForThem ? '-bold' : '' },
            name
          ))

        return Struct({
          id,
          title: name,
          subtitle: [
            h('div.aliases', aliases),
            h('div.key', id.substring(0, KEY_SAMPLE_LENGTH))
          ],
          value: mention(name, id),
          image: api.about.obs.imageUrl(id),
          showBoth: true,
          _isPrefered: normalise(name) === normalise(myNameForThem)
        })
      })
    })
  }

  // used to cobble together additional suggestions
  function buildSuggestion (id) {
    var name = api.about.obs.name(id)
    return Struct({
      id,
      title: name,
      subtitle: h('div.key', id.substring(0, KEY_SAMPLE_LENGTH)),
      value: computed([name, id], mention),
      image: api.about.obs.imageUrl(id),
      showBoth: true
    })
  }
}

function normalise (word) {
  return word.toLowerCase().replace(/(\s|-)/g, '')
}

function mention (name, id) {
  return `[@${name}](${id})`
}

