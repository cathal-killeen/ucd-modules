

const scrape = require('./main');
const axios = require('axios');
var count = 0;

axios.get('http://localhost:3000/api/list_all_modules').then(response => {
    response.data.forEach(course_code => {
        scrape(course_code[1], course_code[2]).then(ucd_module => {
            if(count){
            console.log(ucd_module)
            axios.put('http://localhost:3000/api/modules/create', {
                code: course_code[0],
                subject: ucd_module.subject.replace(/[^\x00-\x7F]/g, ""),
                semester: ucd_module.semester.replace(/[^\x00-\x7F]/g, ""),
                module_coordinator:ucd_module.module_coordinator.replace(/[^\x00-\x7F]/g, ""),
                credits:ucd_module.credits.replace(/[^\x00-\x7F]/g, ""),
                level:ucd_module.level.replace(/[^\x00-\x7F]/g, ""),
                compensation:ucd_module.resits.compensation.replace(/'/g,"''").replace(/[^\x00-\x7F]/g, ""),
                resit_opps:ucd_module.resits.resit_opportunities.replace(/'/g,"''").replace(/[^\x00-\x7F]/g, ""),
                remediation:ucd_module.resits.remediation.replace(/'/g,"''").replace(/[^\x00-\x7F]/g, ""),
                pre_reqs:ucd_module.dependencies.pre_requisites.replace(/'/g,"''").replace(/[^\x00-\x7F]/g, ""),
                required:ucd_module.dependencies.required.replace(/'/g,"''").replace(/[^\x00-\x7F]/g, ""),
                co_reqs:ucd_module.dependencies.co_requisites.replace(/'/g,"''").replace(/[^\x00-\x7F]/g, ""),
                incompatibles:ucd_module.dependencies.incompatibles.replace(/'/g,"''").replace(/[^\x00-\x7F]/g, ""),
                additional_info:ucd_module.dependencies.additional_information.replace(/'/g,"''").replace(/[^\x00-\x7F]/g, ""),
                equiv_modules:ucd_module.dependencies.equivalent_modules.replace(/'/g,"''").replace(/[^\x00-\x7F]/g, ""),
                requirements:ucd_module.dependencies.requirements.replace(/'/g,"''").replace(/[^\x00-\x7F]/g, ""),
                excluded:ucd_module.dependencies.excluded.replace(/'/g,"''").replace(/[^\x00-\x7F]/g, ""),
                recommended:ucd_module.dependencies.recommended.replace(/'/g,"''").replace(/[^\x00-\x7F]/g, ""),
                count_workload:ucd_module.workload.length.toString(),
                count_assess:ucd_module.assessment.length.toString()
            }).then(function (response) {
                console.log(response);
            }).catch(function (error) {
                console.log(error);
            });
            }
            count++;
        })
    })
})

// pool.query(`SELECT code, code_subject, code_course FROM ucd_modules WHERE subject IS NULL`, (err, res) => {
//     const rows = res.rows;

//         var row1 = rows[1100];
    
//         console.log(row1);
//     for(var i=0; i<rows.length;i++){
 
//             scrape(rows[i].code_subject, rows[i].code_course).then(ucd_module => {
//                 console.log('got module!');
//                 pool.query(`UPDATE ucd_modules 
//                             SET subject='${ucd_module.subject,
//                                 module_coordinator='${ucd_module.module_coordinator,
//                                 credits='${ucd_module.credits,
//                                 level='${ucd_module.level,
//                                 compensation='${ucd_module.resits.compensation.replace(/'/g,"''"),
//                                 resit_opps='${ucd_module.resits.resit_opportunities.replace(/'/g,"''"),
//                                 remediation='${ucd_module.resits.remediation.replace(/'/g,"''"),
//                                 pre_reqs='${ucd_module.dependencies.pre_requisites.replace(/'/g,"''"),
//                                 required='${ucd_module.dependencies.required.replace(/'/g,"''")}',
//                                 co_reqs='${ucd_module.dependencies.co_requisites.replace(/'/g,"''")}',
//                                 incompatibles='${ucd_module.dependencies.incompatibles.replace(/'/g,"''")}',
//                                 additional_info='${ucd_module.dependencies.additional_information.replace(/'/g,"''")}',
//                                 equiv_modules='${ucd_module.dependencies.equivalent_modules.replace(/'/g,"''")}',
//                                 requirements='${ucd_module.dependencies.requirements.replace(/'/g,"''")}',
//                                 excluded='${ucd_module.dependencies.excluded.replace(/'/g,"''")}',
//                                 recommended='${ucd_module.dependencies.recommended.replace(/'/g,"''")}',
//                                 count_workload=${ucd_module.workload.length},
//                                 count_assess=${ucd_module.assessment.length}
//                             WHERE code='${ucd_module.course_code}'`, 
//                     (err, res) => {
//                         console.log(err,res);
//                 })  
//             })
   
//         console.log(i);
//     }

// })