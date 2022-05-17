# DynamoDB Large Object Storage Examples

This repository contains example patterns for storing large objects with DynamoDB. The `dynamodb-lob-template.yaml` SAM template can be used to provision the example Node.JS AWS Lambda functions into your AWS accounts:

```
sam build --use-container -t dynamodb-lob-template.yaml
sam deploy --guided
```

An example payload is provided in sample-event.json. This example contains a large (>400KB) string property within it. As this property is larger than the current DynamoDB max item size of 400KB, alternative approaches must be taken to store the object in DynamoDB.

1. Unencoded - This function takes the raw string and attempts to read it to DynamoDB. As the raw string is greater than 400KB, the write fails.

2. zlib - This uses the Node.JS standard zlib library to gzip the string into a binary object. This binary object is then written to DynamoDB. There is also a corresponding read function that shows how to uncompress this object back into the original string.

3. Snappy - This example uses the snappyjs implementation of Google's Snappy compression algorithm. The resulting binary object is then written to DynamoDB. There is also a corresponding read function that shows how to uncompress this object back into the original string.

4. S3 - This example shows how to store the large object "off row" in Amazon S3. The reading code returns a pre-signed URL to the caller, reducing bandwidth requirements for transferring the object between layers of the stack.

5. Item-Splitting - This example splits the large object into multiple items in DynamoDB with the reading code retrieving all parts of the large object using the DynamoDB partition key.
