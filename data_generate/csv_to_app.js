const fs = require('fs'); 
const parse = require('csv-parse');
const axios = require('axios');

const FILE_NAME = './module_descriptor_data.csv'

const EXIST_ENDPOINT = 'http://localhost:3000/api/modules/'

const API_ENDPOINT = 'http://localhost:3000/api/modules/create'

var row_count = 0;

fs.createReadStream(FILE_NAME)
    .pipe(parse({delimiter: ','}))
    .on('data', function(row) {
        row_count++;
        //console.log(row);
        //do something with csvrow  
        var code = row[1]+row[2];
        var short_title = row[4].replace(/'/g,"''")
        var long_title = row[5].replace(/'/g,"''")
        var description = row[8].replace(/'/g,"''")
        var learning_outcomes = row[9].replace(/'/g,"''")

        if(code.length > 0 && row_count>1473){
            setTimeout(args => {
                axios.post(API_ENDPOINT, {
                    code: code.replace(/[^\x00-\x7F]/g, ""),
                    code_subject: row[1].replace(/[^\x00-\x7F]/g, ""),
                    code_number: row[2].replace(/[^\x00-\x7F]/g, ""),
                    school: row[3].replace(/[^\x00-\x7F]/g, ""),
                    short_title: short_title.replace(/[^\x00-\x7F]/g, ""),
                    long_title: long_title.replace(/[^\x00-\x7F]/g, ""),
                    description: description.replace(/[^\x00-\x7F]/g, ""),
                    learning_outcomes: learning_outcomes.replace(/[^\x00-\x7F]/g, "")
                }).then(function (response) {
                    console.log(response);
                }).catch(function (error) {
                    console.log(error);
                });
            }, 100);
        }

        // pool.query(`INSERT INTO ucd_modules (code, code_subject, code_course, school, short_title, long_title, description, learning_outcomes)
        // VALUES ('${code}','${row[1]}','${row[2]}','${row[3]}','${short_title}','${long_title}','${description}','${learning_outcomes}')`, (err, res) => {
        //     if(err && err.code != '23505') console.log(code, row, err);
        // })   
    })
    .on('end',function() {
      //do something wiht csvData
 
    });