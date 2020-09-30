/**
 * @file SimpleDocumentsStore.js
 *
 * @copyright (c) 2020 Abhaya
 * @author Éric Santonacci <eric.santonacci@abhaya.fr>
 * 
 * @description a noSql json documents database (like couchDB if you know it), for small db and exclusive access
 *
 */

const path = require('path');
const fs = require('fs');

class Store {

    constructor(path) {

        this.recordSeparator = '\u241E'; // unicode Record Separator
        this.path = path;
        this.isCloneInMemory = false;

        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, JSON.stringify({
                _id: 0,
                _rev: '1'
            }));
        }

        getMTime(path);

        this.documents = [];
    }

    /**
     * @description: get all 'documents'/objects where field equal/startsWith/contains/greaterThan
     *               a scalar value.
     * @param fieldname {string} 
     * @param value     {scalar} a scalar value
     * @return the documents as an array
     */
    get(query, callback) {

        try {
            if (this.needToLoad()) {
                this.loadDocuments();
            }
        } catch (error) {
            return callback(error);
        }

        let documents = [];
        switch (query.operator) {
            case 'equals':
                documents = this.documents.filter(function (document) {
                    return (document[query.fieldname] === query.value);
                });
                break;

            case 'startsWith':
                documents = this.documents.filter(function (document) {
                    return (document[query.fieldname].startsWith(query.value));
                });
                break;

            case 'contains':
                documents = this.documents.filter(function (document) {
                    return (document[query.fieldname].includes(query.value));
                });
                break;

            default:
                documents = this.documents.filter(function (document) {
                    return (document[query.fieldname] === query.value);
                });
        }

        return callback(null, documents);
    }

    /**
     * @description add object in memory, it does NOT update db file. use it to add several documents in a loop
     *              before save
     * @param {object} data the object/document to add
     */
    add(data) {
        try {
            if (this.needToLoad()) {
                this.loadDocuments();
            }

            this.documents.push(data);
            return null;
        } catch (error) {
            return error;
        }
    }

    /**
     * @description append a document/object to the db/file, it is like 'add' but saving to db file
     *              asyncronoulsy.
     *              Care if you append several documents in a loop, you will probably have a 'lock file' error.
     * @param {object} data the document as an object you want to append
     * @param {function} callback callback function(err) with error if any
     */
    append(data, callback) {

        try {
            if (!this.needToLoad()) {
                this.documents.push(data);
            }
        } catch (error) {
            return callback(error);
        }

        const document = this.recordSeparator + JSON.stringify(data);
        createLock(this.path, function (err) {
            if (err) {
                return callback(err);
            }
            fs.appendFile(this.path, document, function (err) {
                removeLock(this.path);
                return callback(err);
            });
        })
    }

    save(callback) {

        let data = JSON.stringify({
            _id: 0,
            _rev: '1'
        });

        for (let i = 0; i < this.documents.length; i++) {
            data += this.recordSeparator + JSON.stringify(this.documents[i]);
        }

        const self = this;
        createLock(this.path, function (err) {
            if (err) {
                return callback(err);
            }
            fs.writeFile(self.path, data, function (err) {
                removeLock(self.path, function (error) {
                    if (error) {
                        return callback(error);
                    }
                    return callback(err);
                })
            });
        });
    }

    /**
    * @description: determine if datas in RAM are obsolete
    * @return: 'true' if datas are obsolete and need to be reload
    */
    needToLoad() {

        if (!this.isCloneInMemory) {
            return true;
        }

        const stat = fs.statSync(this.path);
        if (stat.mtimeMs > this.storeTimeStamp) {
            return true;
        }

        return false;
    }

    /**
     * @description: load document in RAM as an array of object.
     */
    loadDocuments() {

        getMTime(this.path);

        const db = fs.readFileSync(this.path, 'utf8');
        const records = db.split(this.recordSeparator);

        // start at 2nd record as 1st is for db parameters
        this.documents = [];
        for (let i = 1; i < records.length; i++) {
            this.documents.push(JSON.parse(records[i]));
        }

        this.isCloneInMemory = true;
    }
}

/**
 * 
 * @description Get modification time of file
 * @param {string} path 
 */
function getMTime(path) {

    try {
        const stat = fs.statSync(path);
        this.storeTimeStamp = stat.mtimeMs;
        this.storeSize = stat.size;
    } catch (err) {
        this.storeTimeStamp = 0;
        this.storeSize = undefined;
    }
}

function createLock(filename, callback) {
    const dir = path.dirname(filename);
    const file = path.basename(filename);

    fs.symlink(file, dir + '/.' + file + '.lck', function (err) {
        // TODO: manage error and time stamp of lock file
        callback(err);
    });
}

function removeLock(filename, callback) {

    const dir = path.dirname(filename);
    const file = path.basename(filename);

    fs.unlink(dir + '/.' + file + '.lck', function (err) {
        callback(err);
    });
}

module.exports = Store;