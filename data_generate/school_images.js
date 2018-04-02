const { Pool, Client } = require('pg')
const connectionString = 'postgresql://localhost/Cathal'

const Scraper = require('images-scraper')

const bing = new Scraper.Bing();

bing.list({
    keyword: 'business',
    num: 1,
    detail: true
})
    .then(function (res) {
        console.log('first 10 results from bing', res);
    }).catch(function (err) {
        console.log('err', err);
    })


const pool = new Pool({
    connectionString: connectionString,
    max: 10000
})

function clean(text) {
    var cleaned = null;
    try {
        cleaned = text.replace(/'/g, "''");
    } catch (e) {
        return null;
    }

    return cleaned;
}


pool.query(`SELECT * FROM school`, (err, res) => {
    const rows = res.rows;
    console.log(rows)

    // console.log(rows)

    // //var row1 = rows[1100];

    // //console.log(row1);
    rows.forEach(row => {
        bing.list({
            keyword: row.name,
            num: 1,
            detail: true
        }).then(function (res) {
            console.log(row.name, res);
            pool.query(`UPDATE school
                            SET image_url='${res[0].url}'
                            WHERE id='${row.id}'`,
                (err, res) => {
                    console.log(err, res);
                })
        }).catch(function (err) {
            console.log('err', err);
        })
    })

})