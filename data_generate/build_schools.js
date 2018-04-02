const { Pool, Client } = require('pg')
const connectionString = 'postgresql://localhost/Cathal'


const pool = new Pool({
    connectionString: connectionString,
    max: 10000
})

function clean(text) {
    var cleaned = null;
    try {
        cleaned = text.replace(/'/g, "''");
    }catch(e){
        return null;
    }

    return cleaned;
}


pool.query(`SELECT DISTINCT school FROM module`, (err, res) => {
    const rows = res.rows;

    console.log(rows)

    //var row1 = rows[1100];

    //console.log(row1);
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var count_modules = 0;
        var count_staff = 0;
        var count_subjects = 0;
        console.log(row.school)
      
        pool.query('SELECT code FROM module'), (err, res) => {
            console.log(err)
            console.log(res)
            // count_modules = res.rows[0].count;
            // console.log(count_modules)
        }
    }

})