   /*
        =============== MONGODB BACKUP SCRIPT ================
        -->>mongodump To dump database
        -->>Convert to Zip File
        -->>Put S3

    */

   var cmd = require('node-cmd');
   var fs = require('fs');
   var aws = require('aws-sdk');
   const ID = process.env.aws_access_id;
   const SECRET = process.env.aws_secret_key;
   const {
       responseModel
   } = require('../model');

   exports.mongobackups = async function (req) {
       try {

           // setTimeout(function () {
           //     console.log("process kill")
           //     process.kill()
           // }, 900000);

           cmd.get(
               '',
               async function (err, data, stderr) {
                   console.log('err while taking mongodump :\n\n', err)
                   console.log('mongodump files :\n\n', data)

                   cmd.get(
                       '"`',
                       function (err, data, stderr) {

                           console.log('err while making zip :\n\n', err)
                           //console.log('zip file data:\n\n',data)

      

                           cmd.get(
                               's3cmd put  /var/www/html/db_backups/`date +"%m-%d-%y"`.zip s3://mealdatabase/`date +"%m-%d-%y"`',
                               function (err, data, stderr) {
                                   console.log('err 2 :\n\n', err)
                                   //console.log('the current dir contains these files 2222:\n\n', data)

                                   cmd.get(
                                       'rm -r /var/www/html/db_backups/`date +"%m-%d-%y"`.zip',
                                       function (err, data, stderr) {})
                                   cmd.get(
                                       'rm -r /var/www/html/db_backups/`date +"%m-%d-%y"`',
                                       function (err, data, stderr) {})
                               })
                       })
               });

       } catch (err) {
           errMessage = typeof err == 'string' ? err : err.message;
           console.log("error--", errMessage);
       }
   }

   exports.mongobackupsapi = async function (req) {
       try {

           // setTimeout(function () {
           //     console.log("process kill")
           //     process.kill()
           // }, 900000);

           cmd.get(
               'mongodump --host 127.0.0.1 --db mealplan --port 27017 --out /var/www/html/db_backups/`date +"%m-%d-%y"`',
               async function (err, data, stderr) {
                   console.log('err while taking mongodump :\n\n', err)
                   console.log('mongodump files :\n\n', data)

                   cmd.get(
                       'zip -r /var/www/html/db_backups/`date +"%m-%d-%y"` /var/www/html/db_backups/`date +"%m-%d-%y"`',
                       function (err, data, stderr) {

                           console.log('err while making zip :\n\n', err)
                           //console.log('zip file data:\n\n',data)

                           //s3cmd put live-socket-server.js s3://jobsfollowal/ https://mealdatabase.s3.amazonaws.com/mealid_icon.png

                           cmd.get(
                               's3cmd put  /var/www/html/db_backups/`date +"%m-%d-%y"`.zip s3://mealdatabase/`date +"%m-%d-%y"`',
                               function (err, data, stderr) {
                                   console.log('err 2 :\n\n', err)
                                   //console.log('the current dir contains these files 2222:\n\n', data)

                                   cmd.get(
                                       'rm -r /var/www/html/db_backups/`date +"%m-%d-%y"`.zip',
                                       function (err, data, stderr) {})
                                   cmd.get(
                                       'rm -r /var/www/html/db_backups/`date +"%m-%d-%y"`',
                                       function (err, data, stderr) {})
                               })
                       })
               });

           return responseModel.successResponse("Backup get successfully");

       } catch (err) {
           errMessage = typeof err == 'string' ? err : err.message;
           console.log("error--", errMessage);
       }
   }
