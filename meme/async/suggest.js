const nest = require('depnest')
const { h, onceTrue } = require('mutant')
const map = require('lodash.map')

exports.gives = nest('meme.async.suggest')

exports.needs = nest({
  'blob.sync.url': 'first',
  'sbot.obs.connection': 'first'
})

exports.create = function (api) {
  return nest('meme.async.suggest', suggestedMeme)

  function suggestedMeme (word, cb) {
    if (word.length < 3) return
    // TODO suggest a random 10?

    word = word.toLowerCase()

    onceTrue(api.sbot.obs.connection, sbot => {
      sbot.meme.search(word, (err, data) => {
        if (err) return console.error(err)

        cb(null, map(data, toSuggestion))
      })
    })
  }

  function toSuggestion (value, key) {
    const topPick = value[0]
    // TODO get a better topPick (filter by user, frequency etc?)
    //
    // return {
    //   image: api.blob.sync.url(key),
    //   title: topPick.name,
    //   // subtitle: topPick.name,
    //   value: '![' + topPick.name + '](' + key + ')'
    // }
    //
    return {
      // image:
      title: h('img.meme', { src: api.blob.sync.url(key) }),
      subtitle: topPick.name,
      value: '![' + topPick.name + '](' + key + ')'
    }
  }
}
