// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const AWS = require("aws-sdk");
const zlib = require("zlib");
const ddb = new AWS.DynamoDB.DocumentClient();
const AWSXRay = require("aws-xray-sdk");

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

const compress = async (input) => {
  const segment = AWSXRay.getSegment();
  const subsegment = segment.addNewSubsegment("subseg");
  return new Promise((resolve, reject) => {
    zlib.gzip(JSON.stringify(input), (err, buffer) => {
      subsegment.close();
      if (!err) {
        resolve(buffer);
      } else {
        reject(err);
      }
    });
  });
};

exports.lambda_handler = async (event, context) => {
  const buffer = await compress(event.payload);

  return await putItem(event.id, buffer);
};
