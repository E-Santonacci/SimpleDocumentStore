# Simple Document Store
a noSql simple JSON document database.

## Why
I'm often working on projects which don't store a big amount of data. I wanted to have a small store easy to use and to implement.

## What is provided or not
* no client-server architecture, database is a local file.
* manage small amount of documents, several hundreds records/documents. Whole documents are loaded in memory.
* no concurrent access, in particular in writes/updates.
* no primary key (yet?).
* no indexes.
* noSql, no structure in db, you can store any javscript object, it's up to you to add 'type' field if needed.
* search by scalar field.
* somehow human readable as file is a stack of JSON. Separator is UNICODE Record Separator ('\u241E').
* you can use text editor to search and update (if you are an adventurer :-) )
* 1 constructor and 3 methods: get/search, append, update

## How to use it
```javascript
const Store = require('simple-document-store');

const store = new Store('tests/adresses.sds');
store.get({ fieldname: 'name', value: 'Place', operator: 'contains' }, function (err, records) {
    if (err) {
        console.log(err);
    } else {
        // need to proceed action to load objets in memory.
        console.log('total in file: ' + store.documents.length);
        console.log('total found: ' + records.length);
    }
});
```

## API
*work in progress* interface not yet stable enough.

### constructor

### get

### append

## Performance
with a 480 documents database of postal adresses with geocoordonates (1 city), looking for a street **took less than 1ms** on a i5 8th generation Intel proc and SSD. File size is 55kb.

In comparison, the same request, with same data on a MySql database located in a datacenter **took between 40 and 50ms**.

I planned to do some test with a local MySQL server.

## Security
No network access, the security is associated with the security of the file system the db file is located on.

## TODO
### Probably
* some file accesses use synchronous node js functions. Evaluate opportunities to use async ones.
* manage primary key.

### If i need it, this is just ideas. may be a "Less Simple Document Store".
* define a scalable file format with pages.
* manage concurrent access.
* implements indexes with b-tree.
* Evaluate opportunities to crypt db file.
* Evaluate opportunities to compress db file or some records.