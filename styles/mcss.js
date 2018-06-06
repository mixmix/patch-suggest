const nest = require('depnest')

exports.gives = nest('styles.mcss')

const suggestBox = `
PatchSuggest {
  overflow-y: auto
  background-color: #fff

  width: max-content
  min-width: 20rem
  max-width: 35rem

  max-height: 70vh

  padding: .2rem .5rem
  border: 1px gainsboro solid
  margin-top: .35rem

  ul {
    list-style-type: none
    padding: 0

    li {
      display: flex
      align-items: center

      padding-right: .2rem
      margin-bottom: .2rem

      img {
        height: 36px
        width: 36px
        min-width: 36px
        padding: .2rem
      }

      strong {
        font-weight: 300
        min-width: 7rem
        margin-left: .5rem
        margin-right: .5rem

        // *** this is a hack for ssb-memes!
        display: flex
        align-items: center

        img.meme {
          max-height: 100px
          width: 100px
          padding: .2rem
        }
        // ***

        span.subtle {
          color: #aaa
        }
      }

      small {
        flex-grow: 1

        margin-left: .5rem
        padding-right: .2rem
        font-size: 1rem

        display: flex
        justify-content: flex-end

        // profile only
        div.aliases {
          flex-grow: 1

          font-size: .8rem
          color: #666
          margin-right: .5rem

          display: flex
          flex-wrap: wrap

          div.alias {
            margin-right: .4rem
            -bold {
              font-weight: 600
            }
          }
        }

        // profile only
        div.key {
          align-self: flex-end

          margin: auto 0

          font-family: monospace
          font-size: .8rem
          min-width: 5rem
        }

        // emoji only
        div.emoji {
          flex-grow: 1
        }

      }
    }

    li.selected {
      color: #fff
      background: #0caaf9

      img {}
      strong {}
      small {
        div.aliases {
          color: #eee
        }
      }
    }
  }
}   
`

exports.create = (api) => {
  return nest('styles.mcss', mcss)

  function mcss (sofar = {}) {
    sofar['patchSuggest.suggestBox'] = suggestBox

    return sofar
  }
}
