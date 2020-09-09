const fs = require('fs');

const helpers = {};
const stripHtml = (html) =>
{
   return html.replace(/<[^>]*>?/gm, '');
}

const updateSchedule = () => {
   fs.readFile('schedule.json', 'utf8', function readFileCallback(err, data){
     if (err){
       console.log(err);
     }
     else {
       obj = JSON.parse(data); //now it an object
       obj.push({ day: '', hour: 1, minute: 2, type: [ 'clock in' ] }); //add some data
       json = JSON.stringify(obj); //convert it back to json
       fs.writeFile('schedule.json', json, 'utf8', ()=> {
         console.log('after')
       }); // write it back 
     }
   });
 }

helpers.stripHtml = stripHtml;
helpers.updateSchedule = updateSchedule;
module.exports = helpers;;