mixin = require './mixin'

module.exports = (app) ->
  registry = app.registry

  Model = registry.getModel 'Model'
  BaseModel = Model.extend 'BaseModel'

  registry.modelBuilder.mixins.define 'BaseRemoting', mixin

  throwNotAttached = (modelName, methodName) ->
    throw new Error('Cannot call ' + modelName + '.' + methodName + '().' + ' The ' + methodName + ' method has not been setup.' + ' The BaseModel has not been correctly attached to a DataSource!')
    return

  staticMethods = [
    'count'
    'create'
    'deleteById'
    'destroyAll'
    'exists'
    'find'
    'findById'
    'findOne'
    'findOrCreate'
    'replaceById'
    'replaceOrCreate'
    'updateAll'
    'updateOrCreate'
  ]

  instanceMethods = [
    'isNewRecord'
    'destroy'
    'remove'
    'delete'
    'updateAttribute'
    'updateAttributes'
    'patchAttributes'
    'replaceAttributes'
    'reload'
  ]

  addMethods = (methods, basePropert) ->
    methods.forEach (method) ->
      baseProperty[method] = ->
        throwNotAttached @modelName, method
        return
      return
    return

  addMethods staticMethods, BaseModel
  addMethods instanceMethods, BaseModel.prototype

  aliasMethods =
    destroyAll: [ 'remove', 'deleteAll' ]
    destroyById: [ 'removeById', 'deleteById' ]
    updateAll: [ 'update' ]
    updateOrCreate: [ 'patchOrCreate', 'upsert' ]

  Object.keys(aliasMethods).forEach (alias) ->
    methods = aliasMethods[alias]

    methods.forEach (method) ->
      BaseModel[method] = BaseModel[alias]

  BaseModel.setup = ->
    Model.setup.call this

    BaseModel = this
    BaseModel.mixin 'BaseRemoting'

    BaseModel

  BaseModel.getIdName = ->
    Model = this

    ds = Model.getDataSource()

    if ds.idName
      ds.idName Model.modelName
    else 'id'

  BaseModel::save = (options = {}, callback = ->) ->
    if typeof options is 'function'
      return @save {}, options

    Model = @constructor

    save = ->
      id = inst.getId()

      if not id
        return Model.create inst, callback

      data = inst.toObject()

      Model.upsert inst, (err) ->
        inst._initProperties data
        callback err, inst

    options.validate = options.validate or true

    inst = this

    if not options.validate
      return save()

    inst.isValid (valid) ->
      if valid
        save()
      else
        err = new Model.ValidationError inst

        callback err, inst

      return
    return

  BaseModel::getIdName = ->
    @constructor.getIdName()

  BaseModel::getId = ->
    @[@getIdName()]

  BaseModel::setId = (val) ->
    @[@getIdName()] = val
    return

  BaseModel.setup()

  BaseModel

