mixin = require './mixin'
async = require 'async'

module.exports = (app) ->
  registry = app.registry

  Model = registry.getModel 'Model'
  BaseModel = Model.extend 'BaseModel'

  registry.modelBuilder.mixins.define 'BaseRemoting', mixin

  throwNotAttached = (modelName, methodName) ->
    throw new Error('Cannot call ' + modelName + '.' + methodName + '().' + ' The ' + methodName + ' method has not been setup.' + ' The BaseModel has not been correctly attached to a DataSource!')
    return

  tasks = []

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

  tasks.push (cb) ->
    async.each staticMethods, (method, done) ->
      BaseModel[method] = ->
        throwNotAttached @modelName, method
        return
      done()
    , cb

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

  tasks.push (cb) ->
    async.each instanceMethods, (method, done) ->
      BaseModel::[method] = ->
        throwNotAttached @modelName, method
        return
      done()
    , cb

  BaseModel.patchOrCreate = BaseModel.updateOrCreate
  BaseModel.upsert = BaseModel.updateOrCreate

  BaseModel.update = BaseModel.updateAll

  BaseModel.removeById = BaseModel.destroyById
  BaseModel.deleteById = BaseModel.destroyById

  BaseModel.remove = BaseModel.destroyAll
  BaseModel.deleteAll = BaseModel.destroyAll

  BaseModel.convertNullToEmpty = (ctx, cb) ->
    if ctx.result is null
      ctx.result = {}

    cb()
    return

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
      callback = options
      options = {}

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
    data = @toObject()

    if !data
      return

    data[@getIdName()]

  BaseModel::setId = (val) ->
    @[@getIdName()] = val
    return

  async.parallel tasks, (err) ->
    BaseModel.setup()

  BaseModel

