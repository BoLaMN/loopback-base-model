module.exports = (Model, options) ->

  { defaultMethods, methods } = Model.definition.settings

  customMethods = Object.keys(methods or {})

  setRemoting = (scope, methodName, options) ->
    fn = scope.prototype[methodName] or scope[methodName]
    fn._delegate = true

    scope.remoteMethod methodName, options

    return

  Model.once 'attached', (server) ->
    scope = server.models[Model.modelName]

    defaultRemotes = require('./remotes') Model

    methodKeys = Object.keys defaultRemotes
    selectedMethods = methodKeys

    if defaultMethods is 'none'
      selectedMethods = []

    extendedKeys = defaultMethods is 'extended'

    if Array.isArray defaultMethods
      selectedMethods = defaultMethods.filter (defaultMethod) ->
        methodKeys.indexOf(defaultMethod) > -1

    selectedMethods.forEach (method) ->
      if customMethods.indexOf(method) > -1
        return

      if method is 'findOrCreate' and not extendedKeys
        return

      options = defaultRemotes[method]
      options.isStatic = options.isStatic or true

      setRemoting scope, method, options

  return