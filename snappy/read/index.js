// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const AWS = require("aws-sdk");
const snappy = require("snappy");
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

exports.lambda_handler = async (event, context) => {
  const widget = await getItem(event.id);
  const segment = AWSXRay.getSegment();
  const subsegment = segment.addNewSubsegment("subseg");
  const uncompressedWidget = await snappy.uncompress(widget.Item.large_object);
  subsegment.close();

  return uncompressedWidget.toString();
};
