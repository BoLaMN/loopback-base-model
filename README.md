# loopback-base-model

Loopback Base Model

* npm install loopback-base-model --save
* within server/server.js add
`require('./base-model') app`

yourmodel.json

```
name: "YourModel"
base: "BaseModel"

defaultMethods: [ 'find', 'create' ] // only enable find and create endpoint
defaultMethods: 'all' // enable all default endpoints
defaultMethods: 'none' // dont expose any endpoints
defaultMethods: 'extended' // enable all default endpoints + findOrCreate endpoint
```

License: MIT
