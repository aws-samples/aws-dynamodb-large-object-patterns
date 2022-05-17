// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const AWS = require("aws-sdk");
const zlib = require("zlib");
const ddb = new AWS.DynamoDB.DocumentClient();
const AWSXRay = require("aws-xray-sdk");

const getItem = async (pk, payload) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      sales_order_id: pk,
      part: "0",
    },
  };
  return ddb.get(params).promise();
};

const uncompress = async (input) => {
  const segment = AWSXRay.getSegment();
  const subsegment = segment.addNewSubsegment("subseg");
  return new Promise((resolve, reject) => {
    return zlib.gunzip(input.Item.large_object, (err, buffer) => {
      subsegment.close();

      if (!err) {
        const widgetString = buffer.toString("utf-8");
        resolve(widgetString);
      } else {
        reject(err);
      }
    });
  });
};

exports.lambda_handler = async (event, context) => {
  const item = await getItem(event.id);
  const result = await uncompress(item);

  return result;
};
