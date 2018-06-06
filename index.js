const nest = require('depnest')

module.exports = {
  patchSuggest: nest({
    'about.async.suggest': require('./about/async/suggest'),
    'channel.async.suggest': require('./channel/async/suggest'),
    'emoji.async.suggest': require('./emoji/async/suggest'),
    'meme.async.suggest': require('./meme/async/suggest'),
    'styles.mcss': require('./styles/mcss')
  })
}
