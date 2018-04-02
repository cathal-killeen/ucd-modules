var url = require('url');
var https = require('https');
var http = require('http')

var requestImageSize = require('request-image-size');

const { Pool, Client } = require('pg')
const connectionString = 'postgresql://localhost/Cathal'

function isPortrait(size) {
    if (size.height >= size.width) return 'TRUE';
    return 'FALSE';
}

const pool = new Pool({
    connectionString: connectionString,
    max: 1000
})


pool.query(`SELECT * FROM staff WHERE image_portrait is null`, (err, res) => {
    const rows = res.rows;
    rows.forEach(row => {
        requestImageSize(row.image_url)
            .then(size => {
                console.log(size);
                pool.query(`UPDATE staff
                    SET image_width='${String(size.width)}',
                        image_height='${String(size.height)}',
                        image_portrait='${isPortrait(size)}'
                        WHERE id='${row.id}'`,
                    (err,res) => {
                        console.log(err, res)
                    })
                   
                
            })
            .catch(err => console.log(row.image_url,err))


        // google.list({
        //     keyword: row.name + ' ucd',
        //     num: 1,
        //     detail: true
        // }).then(function (response) {
        //     console.log(row.name, response);
        //     pool.query(`UPDATE staff
        //                     SET image_url='${response[0].url}'
        //                     WHERE id='${row.id}'`,
        //         (err, res) => {
        //             console.log(err, res);
        //         })
        // }).catch(function (err) {
        //     console.log('err', err);
        // })
    })

})