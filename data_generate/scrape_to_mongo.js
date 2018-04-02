
const scrape = require('./main');
const axios = require('axios');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'secret';

// Database Name
const dbName = 'ucd-modules';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  axios.get('http://localhost:3000/api/list_all_modules').then(response => {
    response.data.forEach(course_code => {
        scrape(course_code[1], course_code[2]).then(ucd_module => {
                // console.log(course_code[0],ucd_module)
                if(ucd_module){
                    let code = course_code[0];
                    let code_subject = course_code[1];
                    let code_number = course_code[2];
                    let school = ucd_module.school;
                    let subject = ucd_module.subject;
                    let title = ucd_module.title;
                    let module_coordinator = ucd_module.module_coordinator;
                    let schedule = [];
                    let workload = [];
                    let assessment = [];

                    if(ucd_module.hasOwnProperty('schedule')){
                        schedule = ucd_module.schedule_array;
                    }
                    if(ucd_module.hasOwnProperty('workload')){
                        workload = ucd_module.workload;
                    }
                    if(ucd_module.hasOwnProperty('assessment')){
                        assessment = ucd_module.assessment;
                    }

                    let mongo_module = {
                        code,
                        code_subject,
                        code_number,
                        school,
                        subject,
                        title,
                        module_coordinator,
                        schedule,
                        workload,
                        assessment
                    }

                    // console.log(mongo_module);

                    db.collection('modules').insertOne(mongo_module).then(res => console.log(res)).catch(err => console.log(err));
                }
                // axios.put('http://localhost:3000/api/modules/create', {
                //     code: course_code[0],
                //     subject: ucd_module.subject.replace(/[^\x00-\x7F]/g, ""),
                //     semester: ucd_module.semester.replace(/[^\x00-\x7F]/g, ""),
                //     module_coordinator:ucd_module.module_coordinator.replace(/[^\x00-\x7F]/g, ""),
                //     credits:ucd_module.credits.replace(/[^\x00-\x7F]/g, ""),
                //     level:ucd_module.level.replace(/[^\x00-\x7F]/g, ""),
                //     compensation:ucd_module.resits.compensation.replace(/'/g,"''").replace(/[^\x00-\x7F]/g, ""),
                //     resit_opps:ucd_module.resits.resit_opportunities.replace(/'/g,"''").replace(/[^\x00-\x7F]/g, ""),
                //     remediation:ucd_module.resits.remediation.replace(/'/g,"''").replace(/[^\x00-\x7F]/g, ""),
                //     pre_reqs:ucd_module.dependencies.pre_requisites.replace(/'/g,"''").replace(/[^\x00-\x7F]/g, ""),
                //     required:ucd_module.dependencies.required.replace(/'/g,"''").replace(/[^\x00-\x7F]/g, ""),
                //     co_reqs:ucd_module.dependencies.co_requisites.replace(/'/g,"''").replace(/[^\x00-\x7F]/g, ""),
                //     incompatibles:ucd_module.dependencies.incompatibles.replace(/'/g,"''").replace(/[^\x00-\x7F]/g, ""),
                //     additional_info:ucd_module.dependencies.additional_information.replace(/'/g,"''").replace(/[^\x00-\x7F]/g, ""),
                //     equiv_modules:ucd_module.dependencies.equivalent_modules.replace(/'/g,"''").replace(/[^\x00-\x7F]/g, ""),
                //     requirements:ucd_module.dependencies.requirements.replace(/'/g,"''").replace(/[^\x00-\x7F]/g, ""),
                //     excluded:ucd_module.dependencies.excluded.replace(/'/g,"''").replace(/[^\x00-\x7F]/g, ""),
                //     recommended:ucd_module.dependencies.recommended.replace(/'/g,"''").replace(/[^\x00-\x7F]/g, ""),
                //     count_workload:ucd_module.workload.length.toString(),
                //     count_assess:ucd_module.assessment.length.toString()
                // }).then(function (response) {
                //     console.log(response);
                // }).catch(function (error) {
                //     console.log(error);
                // });
                
            }).catch(err => console.log(err))
    })
}).catch(err => console.log(err))

//   client.close();
});

