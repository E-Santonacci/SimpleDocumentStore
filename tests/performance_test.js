const { performance } = require('perf_hooks');
const Store = require('../index');

const store = new Store('tests/adresses_grenoble.sds');

const t0 = performance.now();
// store.get({ fieldname: 'id', value: '38185_3000' }, function (err, records) {
store.get({ fieldname: 'name', value: 'Place', operator: 'contains' }, function (err, records) {
    const t1 = performance.now();
    console.log('total in file: ' + store.documents.length);
    if (err) {
        console.log(err);
    } else {
        console.log('temps: ' + (t1 - t0));  // temps: 1.4905000030994415 (equal)
        records[0].type = 'TEST';
    }
});