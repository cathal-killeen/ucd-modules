var htmlToJson = require('html-to-json');
var async = require('async');

// var myArgs = process.argv.slice(2);

//if(myArgs.length !== 2) return console.log("USAGE: node main <SUBJ> <CODE>")

var pt1 = "https://sisweb.ucd.ie/usis/w_sm_web_inf_viewer_banner.show_module?p_subj=";
// var SUBJECT = myArgs[0] || "AMST";
var pt2 = "&p_crse=";
// var CODE = myArgs[1] || "30060";
var pt3 = "&p_term_code=201700&p_return_url=&p_website_mode=PROSPECTIVE&p_semester=Semester%20One&p_crumb=%3CA%20href%3D%22https%3A%2F%2Fsisweb.ucd.ie%2Fusis%2Fw_sm_web_inf_viewer_banner.show_search%3Fp_url%3Dhttps%253A%252F%252Fsisweb.ucd.ie%252Fusis%252Fw_sm_web_inf_viewer_banner.show_search%26p_return_url%3D%26p_website_mode%3DPROSPECTIVE%26p_current_page%3D1%26p_search_by%3DKEYWORD%26p_term_code%3D201600%26p_category%3D%26p_keyword%3DCOMP%26p_search_module_code%3DY%26p_level0%3DY%26p_level1%3DY%26p_level2%3DY%26p_level3%3DY%26p_level4%3DY%26p_level5%3DY%22%3E%20Module%20Search%3C%2FA%3E";

// URL = pt1+SUBJECT+pt2+CODE+pt3;

// console.log(URL);

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


function getModuleJSON(URL,SUBJECT,CODE){
    return new Promise(function(resolve,reject){
        htmlToJson.request(URL, {
            'title': function ($doc){
                return $doc.find('div.page_title').text();
            },
            // 'text': function ($doc) {
            //   return $doc.find('DIV').text();
            // },
            'description': function ($doc) {
                return $doc.find('div#DIV p').html();
            },
            'outcomes': function ($doc) {
                return $doc.find('div#DIVoutcomes p').html();
            },
            // 'table': function ($doc) {
            //
            //    return $doc.find('table.table_top_info tr td.table_top_info_details').text();
            // },
            'table': ['table.table_top_info tr', {
                'title': function ($table) {
                    return $table.find('td.table_top_info_heading').html();
                },
                'detail': function ($table) {
                    return $table.find('td.table_top_info_details').html();
                }
            }],
            'headings': function($doc){
                return this.map('table.table_top_info tr td.table_top_info_heading', function($heading){
                    return $heading.html();
                });
            },
            'details': function($doc){
                return this.map('table.table_top_info tr td.table_top_info_details', function($detail){
                    return $detail.html();
                });
            },
            'workload': function($doc){
                //return $doc.map('div#DIVworkload table tr').html();
                return this.map('div#DIVworkload table tr', function($row){
                    return {
                        title: $row.find('td.table_top_info_heading').text(),
                        hours: $row.find('td.table_top_info_details').text()
                    }
                });
            },
            'assessment': function($doc){
                return this.map('div#DIVassessment table tr', function($row){
                    return this.map('td', function($data){
                        return $data.text();
                    })
                });
            },
            'dependencies': function($doc){
                return this.map('div#DIVdependencies table tr td.table_top_info_details', function($row){
                    return $row.text();
                })
            },
            'resits': function($doc){
                return this.map('div#DIVresits table tr td.table_top_info_details', function($row){
                    return $row.text();
                })
            },
            'schedule': function($doc){
                return this.map('div#DIVschedule table tr', function($data){
                    return this.map('td.table_top_info_details', function($row){
                        return $row.text();
                    })
                })
            }
        }, function (err, result) {

            if(!result || !result.hasOwnProperty('workload')){
                reject();
            }else{

                //console.log(result.details);
                // get course code
                //var code = getCode(result.title);

                // remove first row of tables
                result.workload.shift();
                result.assessment.shift();

                // create assessment array
                var assessment = [];
                result.assessment.forEach(function(row){
                    assessment.push({
                        title: row[0],
                        percentage: row[1],
                        timing: row[2]
                    })
                })

                var schedule = {};
                var schedule_array = [];
                result.schedule.forEach(function(event){
                    sem_off = event[1].split(' ');
                    var sem = 'semester_'+sem_off[1];
                    var type = event[0].toLowerCase();
                    var off = 'offering_'+sem_off[3];

                    async.series([
                        function(cb){
                            if(!schedule.hasOwnProperty(sem)) schedule[sem] = {};
                            cb(null);
                        },
                        function(cb){
                            if(!schedule[sem].hasOwnProperty(type)) schedule[sem][type] = {};
                            cb(null);
                        },
                        function(cb){
                            if(!schedule[sem][type].hasOwnProperty(off)) schedule[sem][type][off] = [];
                            cb(null);
                        }
                    ]);

                    var eventObj = {
                        type: event[0],
                        semester: sem_off[1],
                        offering: sem_off[3],
                        weekday: event[2].substring(0,3),
                        time: getTime(event[2]),
                        weeks: getWeeks(event[2]),
                        weeks_array: getWeeks(event[2]).split(', ')
                    }

                    schedule[sem][type][off].push(eventObj);
                    schedule_array.push(eventObj);
                });

                var module = {
                    title: result.title.substring(0,result.title.length-((SUBJECT+CODE).length+2)).replace(/^\s\s*/, '').replace(/\s\s*$/, ''),
                    course_code: SUBJECT+CODE,  // code.full,
                    course_code_num: CODE,      // code.num,
                    subject: result.details[1],
                    school: result.details[3],
                    school_code: SUBJECT,        // code.school,
                    semester: result.details[4],
                    module_coordinator: result.details[5],
                    credits: result.details[0],
                    level: result.details[2],
                    description: result.description,
                    outcomes: result.outcomes,
                    workload: result.workload,
                    assessment: assessment,
                    resits: {
                        compensation: result.resits[0],
                        resit_opportunities: result.resits[1],
                        remediation: result.resits[3]
                    },
                    dependencies: {
                        pre_requisites: removeUntilColon(result.dependencies[0]),
                        required: removeUntilColon(result.dependencies[1]),
                        co_requisites: removeUntilColon(result.dependencies[2]),
                        incompatibles: removeUntilColon(result.dependencies[3]),
                        additional_information: removeUntilColon(result.dependencies[4]),
                        equivalent_modules: result.dependencies[5],
                        requirements: result.dependencies[7],
                        excluded: result.dependencies[9],
                        recommended: result.dependencies[11]
                    },
                    schedule: schedule,
                    schedule_array: schedule_array
                }

                // for(var i=0;i<result.headings.length;i++){
                //     //console.log(result.headings[i] + ': ' + result.details[i]);
                //     switch (result.headings[i]) {
                //         case 'Credits':
                //             module.credits = result.details[i];
                //             break;
                //         case 'Subject':
                //             module.subject = result.details[i];
                //             break;
                //         case 'School':
                //             module.school = result.details[i];
                //             break;
                //         case 'Semester&#xA0; &#xA0;<a href="W_SM_COM_GUI.HELP_WINDOW?p_term_code=201600&amp;p_text_type=MODULE&amp;p_code=SEMESTER" onclick="return popup(this,&apos;examplea&apos;, &apos;left=150, top=150, width=430, height=350 &apos;)" title="UCD Registration Help" class="helpbox"><img src="/ucd_images/info.gif" alt="Information" border="0" width="12" height="12"></a>':
                //             module.semester_string = result.details[i];
                //             break;
                //         case 'Module Coordinator':
                //             module.module_coordinator = result.details[i];
                //             break;
                //         default:
                //             break;
                //     }
                // }

                resolve(module);
            }
        })  
    })
}


module.exports = function(subject, code) {
    var url = pt1+subject+pt2+code+pt3;
    // console.log(url)

    return new Promise((resolve,reject) => {
        getModuleJSON(url,subject,code).then((module) => {
            resolve(module);
        }).catch(err => {
            console.log(err)
            reject(err)
        });
    })
}

