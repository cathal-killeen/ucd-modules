const { Pool, Client } = require('pg')
const connectionString = 'postgresql://localhost/Cathal'

const Scraper = require('images-scraper')

const bing = new Scraper.Bing();

const google = new Scraper.Google();

// bing.list({
//     keyword: 'business',
//     num: 1,
//     detail: true
// })
//     .then(function (res) {
//         console.log('first 10 results from bing', res);
//     }).catch(function (err) {
//         console.log('err', err);
//     })

// google.list({
//     keyword: 'ucd Mel O Cinneide',
//     num: 1,
//     detail: true
// }).then(function (response) {
//     console.log(response);
//     // pool.query(`UPDATE staff
//     //                 SET image_url='${res[0].url}'
//     //                 WHERE id='${row.id}'`,
//     //     (err, res) => {
//     //         console.log(err, res);
//     //     })
// }).catch(function (err) {
//     console.log('err', err);
// })


const pool = new Pool({
    connectionString: connectionString,
    max: 1000
})


pool.query(`SELECT * FROM staff WHERE image_url is null LIMIT 5`, (err, res) => {
    const rows = res.rows;
    rows.forEach(row => {
        google.list({
            keyword: row.name + ' ucd',
            num: 1,
            detail: true
        }).then(function (response) {
            console.log(row.name, response);
            pool.query(`UPDATE staff
                            SET image_url='${response[0].url}'
                            WHERE id='${row.id}'`,
                (err, res) => {
                    console.log(err, res);
                })
        }).catch(function (err) {
            console.log('err', err);
        })
    })

})
