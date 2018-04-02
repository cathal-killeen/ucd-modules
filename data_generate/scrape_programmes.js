var htmlToJson = require('html-to-json');
var async = require('async');

var url = "https://www.ucd.ie/programmes/";

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const mongo_url = 'secret';
const dbName = 'ucd-modules';

var course_codes = [
    // Ag, Food, Nutrition
    'DN250',
    'DN252',
    'DN253',
    'DN261',
    'DN262',
    'DN271',
    'DN272',

    // Architecture
    'DN100',
    'DN120',

    // Arts, Humanities, Social Sciences
    'DN500',
    // 'DN501',
    'DN510',
    'DN511',
    'DN512',
    'DN513',
    'DN514',
    'DN515',
    'DN519',
    'DN541',

    // Business
    'DN650',
    'DN660',
    'DN670',

    // Engineering
    'DN140',
    'DN150',

    // Law
    'DN600',
    'DN610',
    'DN615',
    'LWJ8',
    'LWS2',
    'LWS6',
    'LWW1',
    'LWW2',
    'LWW3',
    'LWW4',
    'LWW9',
    'LWS3',
    'BSJ4',

    // Medicine
    'DN400',
    'DN401',
    'DN440',

    // Nursing & Midwifery
    'DN450',
    'DN451',
    'DN452',
    'DN453',

    // Physiotherapy
    'DN420',

    // Radiography,
    'DN410',

    // Science
    'DN200',
    'DN201',
    'DN230',
    'CSS1',
    'CSSA',
    'BLS1',
    'CLS1',
    'ZYU1',
    'MHS1',
    'ZYU2',

    // Social Science
    'DN550',

    // Sport & Performance
    'DN425',
    'DN430',

    // Veterninary Medicine
    'DN300',
    'DN301',
    'DN310'

]

var removeUntilColon = function(string){
    return string.substring(string.indexOf(":") + 1).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

var getCode = function(string){
    var regExp = /\(([^)]{5,}0)\)/;
    var matches = regExp.exec(string);
    return {
        full: matches[1],
        num: matches[1].substring(matches[1].length-5,matches[1].length),
        school: matches[1].substring(0,matches[1].length-5)
    }
}

var getWeeks = function(string){
    var regExp = /\(([^)]+)\)/;
    var matches = regExp.exec(string);
    return matches[1];
}

var getTime = function(string){
    var startRE = /\:([^)]+)\-/;
    var endRE = /\-([^)]+)\(/;
    var start = startRE.exec(string);
    var end = endRE.exec(string);

    return {
        start: start[1].substring(1,start[1].length),
        end: end[1].substring(0,end[1].length-1)
    }
}

const flatten = list => list.reduce(
    (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
);


function getProgrammeJSON(code){
    return new Promise(function(resolve,reject){
        htmlToJson.request(url + code, {
            'title': function ($doc){
                return $doc.find('div.page_title').text();
            },
            'modules': function($doc) {
                return this.map('div table tr', function($row){
                    return this.map('td', function($data){
                        let text = $data.text();
                        if(text.length > 5 && text.length < 12 && text.indexOf(' ') < 0 &&
                            text.indexOf('Credit') < 0 &&
                            text.indexOf('Semester') < 0
                        ) return text;
                    })
                });
            }
            // 'description': function ($doc) {
            //     return $doc.find('div#DIV p').html();
            // },
            // 'outcomes': function ($doc) {
            //     return $doc.find('div#DIVoutcomes p').html();
            // },
            // 'table': ['table.table_top_info tr', {
            //     'title': function ($table) {
            //         return $table.find('td.table_top_info_heading').html();
            //     },
            //     'detail': function ($table) {
            //         return $table.find('td.table_top_info_details').html();
            //     }
            // }],
            // 'headings': function($doc){
            //     return this.map('table.table_top_info tr td.table_top_info_heading', function($heading){
            //         return $heading.html();
            //     });
            // },
            // 'details': function($doc){
            //     return this.map('table.table_top_info tr td.table_top_info_details', function($detail){
            //         return $detail.html();
            //     });
            // },
            // 'workload': function($doc){
            //     //return $doc.map('div#DIVworkload table tr').html();
            //     return this.map('div#DIVworkload table tr', function($row){
            //         return {
            //             title: $row.find('td.table_top_info_heading').text(),
            //             hours: $row.find('td.table_top_info_details').text()
            //         }
            //     });
            // },
            // 'assessment': function($doc){
            //     return this.map('div#DIVassessment table tr', function($row){
            //         return this.map('td', function($data){
            //             return $data.text();
            //         })
            //     });
            // },
            // 'dependencies': function($doc){
            //     return this.map('div#DIVdependencies table tr td.table_top_info_details', function($row){
            //         return $row.text();
            //     })
            // },
            // 'resits': function($doc){
            //     return this.map('div#DIVresits table tr td.table_top_info_details', function($row){
            //         return $row.text();
            //     })
            // },
            // 'schedule': function($doc){
            //     return this.map('div#DIVschedule table tr', function($data){
            //         return this.map('td.table_top_info_details', function($row){
            //             return $row.text();
            //         })
            //     })
            // }
        }, function (err, result) {

            let programme = {
                code: code,
                title: result.title,
                modules_list: flatten(result.modules).filter(e => e != undefined)
            }

            // console.log(modules);
            
            resolve(programme);
        })  
    })
}

// let code = 'DN600';

console.log(course_codes.length)

MongoClient.connect(mongo_url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);

    course_codes.forEach(code => 
        getProgrammeJSON(code).then((programme) => {
            console.log(programme);
            db.collection('programmes').insertOne(programme).then(res => console.log(res)).catch(err => console.log(err));
        }).catch(err => {
            console.log(err)
        })
    );
});
