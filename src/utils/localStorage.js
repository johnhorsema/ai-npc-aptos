import { ref, inject, reactive, watch } from 'vue'

const localStorage = {

  install(app) {

    app.config.globalProperties.$localStorage = reactive(new LocalStorage('dusty'))

    app.provide('localStorage', app.config.globalProperties.$localStorage)

  }

}

class LocalStorage {
  constructor(namespace = 'default') {
    this.namespace = namespace
    this.store = reactive({})
    this.unwatch = {}
  }

  getItem(key) {
    return JSON.parse(window.localStorage.getItem(`${this.namespace}.${key}`))
  }

  setItem(key, value) {
    window.localStorage.setItem(`${this.namespace}.${key}`, JSON.stringify(value))
  }

  removeItem(key) {
    window.localStorage.removeItem(`${this.namespace}.${key}`)
    this.unwatch[key]()
  }

  useLocalStorage(key, initialValue) {

    this.store[key] = ref(initialValue)

    if (this.getItem(key)) {
      this.store[key] = ref(this.getItem(key))
    }
    else {
      this.setItem(key, initialValue)
    }

    this.unwatch[key] = watch(this.store[key], newValue => {
      this.setItem(key, newValue)
    })

    return this.store[key]

  }

}

export default localStorage
