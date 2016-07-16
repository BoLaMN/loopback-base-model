module.exports = function(Model, options) {
  var defaultMethods, methods, setRemoting;
  defaultMethods = Model.definition.settings.defaultMethods;
  setRemoting = function(scope, methodName, options) {
    var fn;
    fn = scope.prototype[methodName] || scope[methodName];
    fn._delegate = true;
    scope.remoteMethod(methodName, options);
  };
  methods = {
    count: {
      accepts: {
        arg: "where",
        description: "Criteria to match model instances",
        type: "object"
      },
      accessType: "READ",
      description: "Count instances of the model matched by where from the data source.",
      http: {
        path: "/count",
        verb: "get"
      },
      returns: {
        arg: "count",
        type: "number"
      }
    },
    create: {
      accepts: {
        arg: "data",
        description: "Model instance data",
        http: {
          source: "body"
        },
        type: "object"
      },
      accessType: "WRITE",
      description: "Create a new instance of the model and persist it into the data source.",
      http: {
        path: "/",
        verb: "post"
      },
      returns: {
        arg: "data",
        root: true,
        type: Model.modelName
      }
    },
    deleteById: {
      accepts: {
        arg: "id",
        description: "Model id",
        http: {
          source: "path"
        },
        required: true,
        type: "any"
      },
      accessType: "WRITE",
      aliases: ["destroyById", "removeById"],
      description: "Delete a model instance by id from the data source.",
      http: {
        path: "/:id",
        verb: "del"
      },
      returns: {
        arg: "count",
        root: true,
        type: "object"
      }
    },
    destroyAll: {
      accepts: {
        arg: "where",
        description: "filter.where object",
        type: "object"
      },
      accessType: "WRITE",
      description: "Delete all matching records.",
      http: {
        path: "/",
        verb: "del"
      },
      returns: {
        arg: "count",
        description: "The number of instances deleted",
        root: true,
        type: "object"
      },
      shared: false
    },
    exists: {
      accepts: {
        arg: "id",
        description: "Model id",
        required: true,
        type: "any"
      },
      accessType: "READ",
      description: "Check whether a model instance exists in the data source.",
      http: [
        {
          path: "/:id/exists",
          verb: "get"
        }, {
          path: "/:id",
          verb: "head"
        }
      ],
      rest: {
        after: Model.convertNullToEmpty
      },
      returns: {
        arg: "exists",
        type: "boolean"
      }
    },
    find: {
      accepts: {
        arg: "filter",
        description: "Filter defining fields, where, include, order, offset, and limit",
        type: "object"
      },
      accessType: "READ",
      description: "Find all instances of the model matched by filter from the data source.",
      http: {
        path: "/",
        verb: "get"
      },
      returns: {
        arg: "data",
        root: true,
        type: [Model.modelName]
      }
    },
    findById: {
      accepts: [
        {
          arg: "id",
          description: "Model id",
          http: {
            source: "path"
          },
          required: true,
          type: "any"
        }, {
          arg: "filter",
          description: "Filter defining fields and include",
          type: "object"
        }
      ],
      accessType: "READ",
      description: "Find a model instance by id from the data source.",
      http: {
        path: "/:id",
        verb: "get"
      },
      rest: {
        after: Model.convertNullToEmpty
      },
      returns: {
        arg: "data",
        root: true,
        type: Model.modelName
      }
    },
    findOne: {
      accepts: {
        arg: "filter",
        description: "Filter defining fields, where, include, order, offset, and limit",
        type: "object"
      },
      accessType: "READ",
      description: "Find first instance of the model matched by filter from the data source.",
      http: {
        path: "/findOne",
        verb: "get"
      },
      rest: {
        after: Model.convertNullToEmpty
      },
      returns: {
        arg: "data",
        root: true,
        type: Model.modelName
      }
    },
    patchAttributes: {
      isStatic: false,
      accepts: {
        arg: "data",
        description: "An object of model property name/value pairs",
        http: {
          source: "body"
        },
        type: "object"
      },
      accessType: "WRITE",
      aliases: ["updateAttributes"],
      description: "Patch attributes for a model instance and persist it into the data source.",
      http: [
        {
          path: "/",
          verb: "patch"
        }
      ],
      isStatic: false,
      returns: {
        arg: "data",
        root: true,
        type: Model.modelName
      }
    },
    patchOrCreate: {
      accepts: {
        arg: "data",
        description: "Model instance data",
        http: {
          source: "body"
        },
        type: "object"
      },
      accessType: "WRITE",
      aliases: ["upsert", "updateOrCreate"],
      description: "Patch an existing model instance or insert a new one into the data source.",
      http: [
        {
          path: "/",
          verb: "patch"
        }
      ],
      returns: {
        arg: "data",
        root: true,
        type: Model.modelName
      }
    },
    replaceById: {
      accepts: [
        {
          arg: "id",
          description: "Model id",
          http: {
            source: "path"
          },
          required: true,
          type: "any"
        }, {
          arg: "data",
          description: "Model instance data",
          http: {
            source: "body"
          },
          type: "object"
        }
      ],
      accessType: "WRITE",
      description: "Replace attributes for a model instance and persist it into the data source.",
      http: [
        {
          path: "/:id/replace",
          verb: "post"
        }
      ],
      returns: {
        arg: "data",
        root: true,
        type: Model.modelName
      }
    },
    replaceOrCreate: {
      accepts: {
        arg: "data",
        description: "Model instance data",
        http: {
          source: "body"
        },
        type: "object"
      },
      accessType: "WRITE",
      description: "Replace an existing model instance or insert a new one into the data source.",
      http: [
        {
          path: "/replaceOrCreate",
          verb: "post"
        }
      ],
      returns: {
        arg: "data",
        root: true,
        type: Model.modelName
      }
    },
    updateAll: {
      accepts: [
        {
          arg: "where",
          description: "Criteria to match model instances",
          http: {
            source: "query"
          },
          type: "object"
        }, {
          arg: "data",
          description: "An object of model property name/value pairs",
          http: {
            source: "body"
          },
          type: "object"
        }
      ],
      accessType: "WRITE",
      aliases: ["update"],
      description: "Update instances of the model matched by where from the data source.",
      http: {
        path: "/update",
        verb: "post"
      },
      returns: {
        arg: "count",
        description: "The number of instances updated",
        root: true,
        type: "object"
      }
    }
  };
  Model.once('attached', function(server) {
    var extendedKeys, i, len, method, methodKeys, results, scope, selectedMethods;
    scope = server.models[Model.modelName];
    methodKeys = Object.keys(methods);
    methods.findOrCreate = {
      description: 'Find else create a new instance of the model and persist it into the data source',
      accepts: {
        arg: 'data',
        type: 'object',
        required: true,
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'data',
        type: Model.modelName,
        root: true
      },
      http: {
        verb: 'post',
        path: '/findOrCreate'
      }
    };
    extendedKeys = ['findOrCreate'];
    if (!defaultMethods) {
      defaultMethods = 'all';
    }
    if (typeof defaultMethods === 'string') {
      selectedMethods = (function() {
        switch (defaultMethods) {
          case 'all':
            return methodKeys;
          case 'none':
            return [];
          case 'extended':
            return methodKeys.concat(extendedKeys);
        }
      })();
    } else if (Array.isArray(defaultMethods)) {
      selectedMethods = defaultMethods.filter(function(defaultMethod) {
        return methodKeys.indexOf(defaultMethod > -1);
      });
    } else {
      return;
    }
    results = [];
    for (i = 0, len = selectedMethods.length; i < len; i++) {
      method = selectedMethods[i];
      options = methods[method];
      options.isStatic = options.isStatic || true;
      results.push(setRemoting(scope, method, options));
    }
    return results;
  });
};
