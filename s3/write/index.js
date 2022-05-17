// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const AWS = require("aws-sdk");
const ddb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

const putItem = async (pk, lobPointer) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      sales_order_id: pk,
      part: "0",
      large_object: lobPointer,
    },
  };

  return ddb.put(params).promise();
};

const storeLob = async (pk, lob) => {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: pk,
    Body: JSON.stringify(lob),
  };

  return s3.putObject(params).promise();
};

exports.lambda_handler = async (event, context) => {
  // Put large object data in S3
  await storeLob(event.id, event.payload);

  // Put metadata with S3 Object Url in DynamoDB
  return await putItem(
    event.id,
    "s3://" + process.env.BUCKET_NAME + "/" + event.id
  );
};
