// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const AWS = require("aws-sdk");
const ddb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

const getItem = async (pk) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      sales_order_id: pk,
      part: "0",
    },
  };

  return ddb.get(params).promise();
};

exports.lambda_handler = async (event, context) => {
  // Get metadata from DynamoDB
  const item = await getItem(event.id);
  const urlParts = item.Item.large_object.split("/");
  const params = { Bucket: urlParts[2], Key: urlParts[3] };

  // Get Presigned URL to allow caller to retrieve large object from S3
  const url = s3.getSignedUrl("getObject", params);
  item.Item.large_object = url;
  console.log(item);

  return item;
};
