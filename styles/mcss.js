const nest = require('depnest')

exports.gives = nest('styles.mcss')

const suggestBox = `
body {
  div.suggest-box {
    width: max-content
    background-color: #fff

    min-width: 20rem
    max-width: 35rem
    padding: .2rem .5rem
    margin-top: .35rem
    border: 1px gainsboro solid

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

          div.key {
            align-self: flex-end

            margin: auto 0

            font-family: monospace
            font-size: .8rem
            min-width: 5rem
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
}
`

exports.create = (api) => {
  return nest('styles.mcss', mcss)

  function mcss (sofar = {}) {
    sofar['patchSuggest.suggestBox'] = suggestBox

    return sofar
  }
}
