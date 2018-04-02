const { Pool, Client } = require('pg')
const connectionString = 'postgresql://localhost/Cathal'

const Vibrant = require('node-vibrant')


const pool = new Pool({
    connectionString: connectionString,
    max: 10000
})

// Vibrant.from('http://efdreams.com/data_images/dreams/white/white-01.jpg')
//         .getPalette()
//         .then((palette) => console.log(palette))

function createRGBString(rgb_array) {
    return ""
        + parseInt(rgb_array[0]) + ','
        + parseInt(rgb_array[1]) + ','
        + parseInt(rgb_array[2])
}

pool.query(`SELECT * FROM school`, (err, res) => {
    const rows = res.rows;

    // console.log(rows)

    // //var row1 = rows[1100];

    // //console.log(row1);
    rows.forEach(row => {

        Vibrant.from(row.image_url)
            .getPalette()
            .then((palette) => {
                let rgb = createRGBString(palette.DarkVibrant._rgb);
                pool.query(`UPDATE school
                    SET color_code='${rgb}'
                    WHERE id='${row.id}'`,
                    (err, res) => {
                        console.log(err, res);
                    })
                console.log(row.name, rgb)
    })
        .catch(err => {
            //console.log(err)
        })



    // bing.list({
    //     keyword: row.name,
    //     num: 1,
    //     detail: true
    // }).then(function (res) {
    //     console.log(row.name, res);
    //     
    // }).catch(function (err) {
    //     console.log('err', err);
    // })
})

})