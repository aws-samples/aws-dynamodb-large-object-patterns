// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const AWS = require("aws-sdk");
const ddb = new AWS.DynamoDB.DocumentClient();

const queryItems = async (pk) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: "sales_order_id = :hkey",
    ExpressionAttributeValues: {
      ":hkey": pk.toString(),
    },
  };

  return ddb.query(params).promise();
};

exports.lambda_handler = async (event, context) => {
  const parts = await queryItems(event.id); // Get all parts by partition key
  let lob = "";
  parts.Items.forEach(function (element) {
    lob += Buffer.from(element.large_object).toString(); // rebuild large string from parts
  });
  console.log(lob);

  return lob;
};
