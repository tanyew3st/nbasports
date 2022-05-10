var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
var db = new AWS.DynamoDB();
var count = 0;


//this is the query to add a user to the users table
var add_User = function (username, password, fullname, email, callback) {
  var params = {
    Item: {
      "username": { "S": username },
      "password": { "S": password },
      "fullname": { "S": fullname },
      "email": { "S": email },
    },
    TableName: "Users",
    ConditionExpression: "attribute_not_exists(username)",
  };

  db.putItem(params, function (err, data) {
    if (err) {
      callback(err)
    }
    else {
      callback(null, 'Success')
    }
  });
}


//query the user table for a particular user and retrieve their password
var myDB_lookup = function (username, callback) {

  var params = {
    KeyConditions: {
      username: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [{ S: username }]
      }
    },
    TableName: "Users",
    AttributesToGet: ['password']
  };

  db.query(params, function (err, data) {

    if (err || data.Items.length == 0) {

      callback(err, null);

    } else {
      callback(err, data.Items[0].password.S);
    }
  });
}

//adds query to be associated with a user
var add_Query = function (username, query, callback) {
  var params = {
    Item: {
      "username": { "S": username },
      "query": { "S": query },
    },
    TableName: "Queries",
  };

  count++;

  db.putItem(params, function (err, data) {
    if (err) {
      console.log(err)
      callback(err)
    }
    else {
      console.log("YAY!")
      callback(null, 'Success')
    }
  });
}


//get all of the queries of a particular user
var queries_Of_User = function (username, callback) {

  var params = {
    KeyConditions: {
      username: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [{ S: username }]
      }
    },
    TableName: "Queries",
    AttributesToGet: ['query']
  };

  db.query(params, function (err, data) {

    if (err || data.Items.length == 0) {
      callback(err, null);

    } else {
      callback(err, data.Items);
    }
  });
}



var database = {
  addUser: add_User,
  lookup: myDB_lookup,
  addQuery: add_Query,
  queriesofuser: queries_Of_User
};

module.exports = database;


