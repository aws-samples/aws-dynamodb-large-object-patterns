// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const AWS = require("aws-sdk");
const ddb = new AWS.DynamoDB.DocumentClient();
let ddbObjectSize = 400 * 1000;

const putItem = async (pk, sk, payload) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      sales_order_id: pk,
      part: sk,
      large_object: payload,
    },
  };
  return ddb.put(params).promise();
};

exports.lambda_handler = async (event, context) => {
  const eventBuffer = Buffer.from(JSON.stringify(event.payload));
  ddbObjectSize = event.ddbObjectSize ?? ddbObjectSize;
  const eventSize = Buffer.byteLength(eventBuffer);
  const sectionsRequired = eventSize / ddbObjectSize;

  for (let i = 0; i < sectionsRequired; i++) {
    await putItem(
      event.id, // partition key is event id
      i.toString(), // sort key is item part
      eventBuffer.slice(i * ddbObjectSize, i * ddbObjectSize + ddbObjectSize)
    );
  }
};
