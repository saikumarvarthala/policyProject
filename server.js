const express = require('express')
const app = express();
const MongoClient = require('mongodb').MongoClient
var db;

// Remember to change YOUR_USERNAME and YOUR_PASSWORD to your username and password! 
MongoClient.connect('mongodb://root:root12@ds343985.mlab.com:43985/bigcompany', (err, database) => {
  if (err) return console.log(err);
  db = database;
  app.listen(process.env.PORT || 3000, () => {
    console.log('listening on 3000');
  })
})

var csvjson = require('csvjson');
var fs = require('fs');
var options = {
  delimiter: ',', // optional
  quote: '"' // optional
};

app.post('/users', (req, res) => {
  var file_data = fs.readFileSync('./SampleSheetSheet1.csv', { encoding: 'utf8' });
  var result = csvjson.toObject(file_data, options);
  for (let i = 0; i < result.length; i++) {
    var obj = {
      userType: result[i].userType,
      email: result[i].email,
      gender: result[i].gender,
      firstname: result[i].firstname,
      city: result[i].city,
      phone: result[i].phone,
      address: result[i].address,
      state: result[i].state,
      zip: result[i].zip,
      dob: result[i].dob
    }
    db.collection('user').save(obj, (err) => {
      if (err) return console.log(err);
      else {
        var obj1 = {
          agent: result[i].agent

        }
        db.collection('agent').save(obj1, (err, agent) => {
          if (err) return console.log(err);
          else {
            var obj2 = {
              user: result[i].firstname,
              account_name: result[i].account_name,
              account_type: result[i].account_type
            }
            db.collection('usersAccount').save(obj2, (err) => {
              if (err) return console.log(err);
              else {
                var obj3 = {
                  agent: result[i].agent,
                  user: result[i].firstname,
                  category_name: result[i].category_name,
                  policy_mode: result[i].policy_mode,
                  policy_number: result[i].policy_number,
                  policy_type: result[i].policy_type,
                  policy_start_date: result[i].policy_start_date,
                  policy_end_date: result[i].policy_end_date
                }
                db.collection('policyCategory').save(obj3, (err) => {
                  if (err) return console.log(err);
                  else {
                    var obj4 = {
                      agent: result[i].agent,
                      user: result[i].firstname,
                      company_name: result[i].company_name,
                      policy_mode: result[i].policy_mode,
                      policy_number: result[i].policy_number,
                      policy_type: result[i].policy_type,
                      policy_start_date: result[i].policy_start_date,
                      policy_end_date: result[i].policy_end_date
                    }
                    db.collection('policyCarrier').save(obj4, (err) => {
                      if (err) return console.log(err);
                      if (i == result.length - 1) {
                        return res.json({ message: "data saved" })
                      }
                    })
                  }
                })
              }
            })
          }
        })

      }

    })
  }
})

app.get('/:firstname', (req, res) => {
  db.collection('policyCarrier').findOne({ user: req.params.firstname }, function (err, data1) {
    if (err) {
      throw err;
    }
    if(!data1){
      res.json({message:"username doesnot exist."})
    }
    else {
      console.log(data1);
      db.collection('policyCategory').findOne({ user: req.params.firstname }, function (err, data2) {
        if (err) {
          throw err;
        }
        else {
          var policyInfo = {
            "agent": data1.agent,
            "user": data1.firstname,
            "company_name": data1.company_name,
            "policy_mode": data1.policy_mode,
            "policy_number": data1.policy_number,
            "policy_type": data1.policy_type,
            "policy_start_date": data1.policy_start_date,
            "policy_end_date": data1.policy_end_date,
            "category_name": data2.category_name,
            "user":data1.user
          }
          res.json(policyInfo);
        }
      })
    }
  })
})

app.get('/abc/test', (req, res) => {
  //policyCarrier
  //policyCategory
  db.collection('policyCarrier').aggregate([{$group:{_id:"$user",policy:{$push:"$$ROOT"}}}],function(err,data){
    if(err){
      throw err;
    }
    if(data.length==0){
      return res.json({message:"No data found."});
    }
    else{
      return res.json(data);
    }
  })
})
