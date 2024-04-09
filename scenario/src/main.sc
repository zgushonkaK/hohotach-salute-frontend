require: js/actions.js
require: js/reply.js

require: sc/generateJoke.sc

theme: /
    state: Start
        q!: $regex</start>
        q!: (запусти | открой | вруби) Генератор анекдотов
        a: Начнём

    state: Fallback
        event!: noMatch
        a: Я не понял
