// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const AWS = require("aws-sdk");
const ddb = new AWS.DynamoDB.DocumentClient();

const putItem = async (pk, payload) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      sales_order_id: pk,
      part: "0",
      large_object: payload,
    },
  };
  return ddb.put(params).promise();
};

exports.lambda_handler = async (event, context) => {
  return await putItem(event.id, event.payload);
};
