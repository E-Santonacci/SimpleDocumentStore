/**
 * Fill db with datas
 */

const Store = require('../index');
const { performance } = require('perf_hooks');

let store = new Store('tests/adresses_grenoble.sds');

var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('tests/adresses-addok-38.ndjson')
});

let streetCount = 0;
let lineCount = 0;
const t0 = performance.now();

lineReader.on('line', function (line) {

    lineCount++;
    const document = JSON.parse(line);
    if (document.postcode === '38000') {
        streetCount++;
        store.append({
            id: document.id,
            type: document.type,
            name: document.name,
            postcode: document.postcode,
            city: document.city,
            lat: document.lat,
            long: document.long,
        }, function (err) {
            if (err) {
                console.log(err);
            }
        })
    }
});

lineReader.on('close', function () {
    const t1 = performance.now();
    console.log('trouvées: ' + streetCount);
    console.log('total: ' + lineCount);

    console.log('temps: ' + (t1 - t0));

});