# Simple Document Store
a noSql simple JSON documents database.

## Why
I'm often working on projects which don't store a big amount of data. I wanted to have a small store easy to use and to implement.

## What is provided or not
* no client-server architecture, database is a local file.
* manage small amount of documents, several hundreds records/documents. Whole documents are loaded in memory.
* efficient if you read much more than you write data.
* no concurrent access, in particular in writes/updates.
* no primary key (yet?).
* no indexes.
* noSql, no structure in db, you can store any javscript object, it's up to you to add 'type' field if you need collection.
* search by scalar field.
* somehow human readable as file is a stack of JSON. Separator is UNICODE Record Separator ('\u241E').
* you can use text editor to search and update (if you are an adventurer :-) ).
* 1 constructor and a few methods: get/search, add, save, append.

## How to use it
```javascript
const Store = require('simple-document-store');

const store = new Store('tests/adresses.sds');
store.get({ fieldname: 'name', value: 'Place', operator: 'startsWith' }, function (err, records) {
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
*work in progress* still testing the code. but you can give it a try and make me feedback :). Code is short and commented.

### constructor
```javascript
const store = new Store(path);
```
**path**
the path of the document base database.

If the file does not exist, it is created.


### get
Get/search for documents.

```javascript
store.get(parameters, callback);
```

**parameters**
it is an object with 3 properties
* _fieldname_ the name of the property to evaluate
* _value_ the value used to evaluate the propetrty
* _operator_ (optional) the type of operation: 'equals', 'startsWith', 'contains'. 'equals' by default if omitted.


**callback** (err, documents)
the callback returns an array of document corresponding to the search

### add
Add a document in memory but does not save it to db file. Use it to add several documents in a loop before save all in one go.
```javascript
for(let i=0; i< 10;i++){
    store.add({
        id:i,
        label: 'label' + i
    });
}

store.save(funtion(err){
    console.log(err);
});
```


### append
Add a document at end of database asynchronously. Care, using 'append' in a loop will probably cause a 'file lock'.
```javascript
store.append(object, function(err){
    console.log(err);
});
```
**object**
the object to add.

**callback**(err)
err is not null if something went wrong.

### update
It is NOT a method. you can directly update results of a search and modify documents returned, then save.


## Performance
with a 480 documents database of postal adresses with geocoordonates (1 city), looking for a street **took less than 1ms** on a i5 8th generation Intel proc and SSD. File size is 55kb.

In comparison, the same request, with same data on a MySql database located in a datacenter **took between 40 and 50ms**.

I planned to do some test with a local MySQL server.

## Security
No network access, the security is associated with the security of the file system the db file is located on.

## TODO
* write better tests
* make backup of db file before overwrite.
* add parameters in constructor for record separator or file version rotation for instance.

### Probably
* some file accesses use synchronous node js functions. Evaluate opportunities to use async ones or go to promises.
* manage primary key.
* regex in search

### If i need it, this is just ideas. may be a "Less Simple Document Store".
* define a scalable file format with pages.
* manage concurrent access.
* implements indexes with b-tree.
* Evaluate opportunities to crypt db file.
* Evaluate opportunities to compress db file or some records.