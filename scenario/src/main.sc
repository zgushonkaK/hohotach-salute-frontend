require: slotfilling/slotFilling.sc
  module = sys.zb-common

require: js/actions.js
require: js/getters.js
require: js/reply.js

require: sc/generateJoke.sc
require: sc/openFavorites.sc
require: sc/addFavorite.sc
require: sc/closeFavorites.sc
require: sc/readJoke.sc

theme: /
    state: Start
        q!: $regex</start>
        q!: (запусти | открой | вруби) Генератор анекдотов
        script:
            initializeUser($request.channelUserId, $context);
        a: Начнём

    state: Fallback
        event!: noMatch
        a: Я не понял
