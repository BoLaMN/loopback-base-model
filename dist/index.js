var async, mixin;

mixin = require('./mixin');

async = require('async');

module.exports = function(app) {
  var BaseModel, Model, instanceMethods, registry, staticMethods, tasks, throwNotAttached;
  registry = app.registry;
  Model = registry.getModel('Model');
  BaseModel = Model.extend('BaseModel');
  registry.modelBuilder.mixins.define('BaseRemoting', mixin);
  throwNotAttached = function(modelName, methodName) {
    throw new Error('Cannot call ' + modelName + '.' + methodName + '().' + ' The ' + methodName + ' method has not been setup.' + ' The BaseModel has not been correctly attached to a DataSource!');
  };
  tasks = [];
  staticMethods = ['count', 'create', 'deleteById', 'destroyAll', 'exists', 'find', 'findById', 'findOne', 'findOrCreate', 'replaceById', 'replaceOrCreate', 'updateAll', 'updateOrCreate'];
  tasks.push(function(cb) {
    return async.each(staticMethods, function(method, done) {
      BaseModel[method] = function() {
        throwNotAttached(this.modelName, method);
      };
      return done();
    }, cb);
  });
  instanceMethods = ['isNewRecord', 'destroy', 'remove', 'delete', 'updateAttribute', 'updateAttributes', 'patchAttributes', 'replaceAttributes', 'reload'];
  tasks.push(function(cb) {
    return async.each(instanceMethods, function(method, done) {
      BaseModel.prototype[method] = function() {
        throwNotAttached(this.modelName, method);
      };
      return done();
    }, cb);
  });
  BaseModel.patchOrCreate = BaseModel.updateOrCreate;
  BaseModel.upsert = BaseModel.updateOrCreate;
  BaseModel.update = BaseModel.updateAll;
  BaseModel.removeById = BaseModel.destroyById;
  BaseModel.deleteById = BaseModel.destroyById;
  BaseModel.remove = BaseModel.destroyAll;
  BaseModel.deleteAll = BaseModel.destroyAll;
  BaseModel.convertNullToEmpty = function(ctx, cb) {
    if (ctx.result === null) {
      ctx.result = {};
    }
    cb();
  };
  BaseModel.setup = function() {
    Model.setup.call(this);
    BaseModel = this;
    BaseModel.mixin('BaseRemoting');
    return BaseModel;
  };
  BaseModel.getIdName = function() {
    var ds;
    Model = this;
    ds = Model.getDataSource();
    if (ds.idName) {
      return ds.idName(Model.modelName);
    } else {
      return 'id';
    }
  };
  BaseModel.prototype.save = function(options, callback) {
    var inst, save;
    if (options == null) {
      options = {};
    }
    if (callback == null) {
      callback = function() {};
    }
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    Model = this.constructor;
    save = function() {
      var data, id;
      id = inst.getId();
      if (!id) {
        return Model.create(inst, callback);
      }
      data = inst.toObject();
      return Model.upsert(inst, function(err) {
        inst._initProperties(data);
        return callback(err, inst);
      });
    };
    options.validate = options.validate || true;
    inst = this;
    if (!options.validate) {
      return save();
    }
    inst.isValid(function(valid) {
      var err;
      if (valid) {
        save();
      } else {
        err = new Model.ValidationError(inst);
        callback(err, inst);
      }
    });
  };
  BaseModel.prototype.getIdName = function() {
    return this.constructor.getIdName();
  };
  BaseModel.prototype.getId = function() {
    var data;
    data = this.toObject();
    if (!data) {
      return;
    }
    return data[this.getIdName()];
  };
  BaseModel.prototype.setId = function(val) {
    this[this.getIdName()] = val;
  };
  async.parallel(tasks, function(err) {
    return BaseModel.setup();
  });
  return BaseModel;
};
