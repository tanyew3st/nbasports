var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
var db = new AWS.DynamoDB();


//this is the query to add a user to the users table
var add_User = function(username, password, fullname, email, callback) {	
    var params = {
        Item: {
          "username": { "S" : username },
          "password": { "S" : password },
           "fullname": { "S" : fullname },
            "email": { "S" : email },
        },
        TableName: "Users",
      ConditionExpression: "attribute_not_exists(username)",
    };
  
    db.putItem(params, function(err, data){
      if (err)
      {
        callback(err)
      }
      else
      {
        callback(null, 'Success')
      }
    });
  }


//modified the lookup function to query the user table
var myDB_lookup = function(username, callback) {

  var params = {
      KeyConditions: {
        username: {
          ComparisonOperator: 'EQ',
          AttributeValueList: [ { S: username } ]
        }
      },
      TableName: "Users",
      AttributesToGet: [ 'password' ]
  };

  db.query(params, function(err, data) {
    
    if (err || data.Items.length == 0) {

      callback(err, null);
      
    } else {
      callback(err, data.Items[0].password.S);
    }	
  });
}

//adds a friend for a user
var add_Query = function(username, query, callback) {		
	var params = {
      Item: {
        "username": { "S" : username },
		"query": { "S" : query },
      },
      TableName: "Queries",
  };

  db.putItem(params, function(err, data){
    if (err)
      callback(err)
    else
      callback(null, 'Success')
  });
}

//gets a list of all friends of the user
var queries_Of_User = function(username, callback) {	
  var params = {
	TableName : "Queries",
	KeyConditionExpression: "#un = :string1",
	ExpressionAttributeNames: {
        "#un": "username",
    },
	ExpressionAttributeValues: {
	  ":string1": { "S" : username },
	},
  };
	
	db.query(params, function(err, data) {
      if (err) {
        callback(err, null);
      } else {
        callback(err, data.Items);
      }
    });
}

/* We define an object with one field for each method. For instance, below we have
   a 'lookup' field, which is set to the myDB_lookup function. In routes.js, we can
   then invoke db.lookup(...), and that call will be routed to myDB_lookup(...). */

//Don't forget to add any new functions to this class, so app.js can call them. (The name before the colon is the name you'd use for the function in app.js; the name after the colon is the name the method has here, in this file.)

var database = { 
	addUser: add_User,
  lookup: myDB_lookup,
  addQuery: add_Query,
  queriesofuser: queries_Of_User
};

module.exports = database;
                                        

