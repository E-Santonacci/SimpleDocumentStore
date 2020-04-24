/**
 * @file SimpleDocumentsStore.js
 *
 * @copyright (c) 2020 Abhaya
 * @author Éric Santonacci <eric.santonacci@abhaya.fr>
 * 
 * @description a noSql json documents database (like couchDB if you know it), for small db and exclusive access
 *
 */

const fs = require('fs');

class Store {

    constructor(path) {

        this.recordSeparator = '\u241E'; // unicode Record Separator
        this.path = path;
        this.isCloneInMemory = false;

        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, JSON.stringify({
                _id: 0,
                _version: '0.1'
            }));
        }

        try {
            const stat = fs.statSync(path);
            this.storeTimeStamp = stat.mtimeMs;
            this.storeSize = stat.size;
        } catch (err) {
            this.storeTimeStamp = 0;
            this.storeSize = undefined;
        }

        this.documents = [];
    }

    /**
     * @description: get all 'documents'/objects where field equal/startsWith/contains/greaterThan
     *               a scalar value.
     * @param fieldname {string} 
     * @param value     {scalar} a scalar value
     * @return the document as an object
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
     * @description append a document/object to the db/file.
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
        fs.appendFile(this.path, document, function (err) {
            return callback(err);
        });

        return callback(null);
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

        try {
            const stat = fs.statSync(this.path);
            this.storeTimeStamp = stat.mtimeMs;
            this.storeSize = stat.size;
        } catch (err) {
            this.storeTimeStamp = 0;
            this.storeSize = undefined;
        }

        const db = fs.readFileSync(this.path, 'utf8');
        const records = db.split(this.recordSeparator);

        // start at 2nd record as 1st is for db parameters
        for (let i = 1; i < records.length; i++) {
            this.documents.push(JSON.parse(records[i]));
        }
    }
}


function getMTime(path){

}

module.exports = Store;