# multer-flydrive-engine
A multer storage engine for flydrive's fluent storage interface

The flydrive storage engine gives you full control on storing files to whatever 
backing storage service you choose to configure through flydrive.

```javascript
var storage = new StorageManager({
  disks: {
    local: {
			driver: 'local',
			root: process.cwd(),
		},
    s3: {
			driver: 's3',
			key: 'AWS_S3_KEY',
			secret: 'AWS_S3_SECRET',
			region: 'AWS_S3_REGION',
			bucket: 'AWS_S3_BUCKET',
		}
  }
});

var storageEngine = FlydriveStorageEngine({
  async disk (req, file) {
    return req.query.dest === 's3' ? storage.disk('s3) : storage.disk('local');
  },
  async destination (req, file) {
    return '/tmp/my-uploads';
  },
  async filename (req, file, cb) {
    return file.fieldname + '-' + Date.now();
  }
})

var upload = multer({ storage: storageEngine });
```

The `disk` attribute is required, and there are two options available,`destination` 
and `filename`. They are all functions that determine where the file should be stored.

`disk` is used to determine which flydrive disk on which to store the file. This can
also be given as a single flydrive storage disk (e.g. `storage.disk()`).

`destination` is used to determine within which folder the uploaded files should
be stored. This can also be given as a `string` (e.g. `'/tmp/uploads'`). If no
`destination` is given, the disk's configured root directory is used. Since the underlying
engine is flydrive, you do not need to worry about directory creation, flydrive
will handle this for you.

`filename` is used to determine what the file should be named inside the folder.
If no `filename` is given, each file will be given a random name that doesn't
include any file extension.

**Note:** Multer will not append any file extension for you, your function
should return a filename complete with an file extension.

Each function gets passed both the request (`req`) and some information about
the file (`file`) to aid with the decision.

Note that `req.body` might not have been fully populated yet. It depends on the
order that the client transmits fields and files to the server.
