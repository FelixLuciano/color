import { reactive } from "https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.11/vue.esm-browser.prod.js"

const defaults = {
    legacyNames: []
}

class Storage {
    constructor (config) {
        this.config = Object.assign(defaults, config)
        this.data = reactive([])

        this.updateLegacy()
        this.load()
    }

    store (item) {
        this.data.push(item)
        this.save()
    }

    remove (index) {
        this.data.splice(index, 1)
        this.save()
    }

    updateLegacy () {
        for (let legacyName of this.config.legacyNames) {
            const legacyStorage = window.localStorage.getItem(legacyName)

            if (legacyStorage) {
                const newStorage = window.localStorage.getItem(this.config.name)
                window.localStorage.setItem(this.config.name, newStorage + legacyStorage)
                window.localStorage.removeItem(legacyName)
            }
        }
    }

    save () {
        const toStore = this.config.save(this.data)
        window.localStorage.setItem(this.config.name, toStore)
    }

    load () {
        const localStorage = window.localStorage.getItem(this.config.name)

        if (localStorage) {
            const data = this.config.load(localStorage)

            this.data = reactive(data)
        }
        else this.save()
    }
}

export default Storage
