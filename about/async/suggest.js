const nest = require('depnest')
const { onceTrue, resolve, h } = require('mutant')

const fallbackImageUrl = 'data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='

exports.gives = nest('about.async.suggest')

exports.needs = nest({
  'blob.sync.url': 'first',
  'sbot.obs.connection': 'first'
})

exports.create = function (api) {
  return nest('about.async.suggest', suggestedProfile)

  // TODO rework this top API!
  function suggestedProfile (text, defaultIds, cb) {
    if (cb === undefined && typeof defaultIds === 'function') return suggestedProfile(text, [], defaultIds)

    onceTrue(api.sbot.obs.connection, ssb => {
      ssb.suggest.profile({ text, defaultIds: resolve(defaultIds), limit: 16 }, (err, items) => {
        if (err) return cb(err)

        cb(null, items.map(Suggestion))
      })
    })

    return true // stop at this depject
  }

  function Suggestion (item) {
    const aliases = new Set(item.names)
    aliases.delete(item.matchedName || item.name)

    return {
      title: item.matchedName || item.name,
      id: item.id,
      subtitle: [
        h('div.aliases', Array.from(aliases)
          .map(name => h('div.alias',
            { className: name === item.name ? '-bold' : '' },
            name
          ))
        ),
        item.following ? null : h('i.fa.fa-question'),
        h('div.key', item.id.substring(0, 10))
      ],
      value: `[@${item.matchedName || item.name}](${item.id})`,
      cls: item.following ? 'following' : null,
      image: item.image ? api.blob.sync.url(item.image) : fallbackImageUrl,
      showBoth: true
    }
  }
}
