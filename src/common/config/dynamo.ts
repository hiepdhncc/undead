import AWS from 'aws-sdk';

AWS.config.update({
  region: 'ap-southeast-1',
});

export const dynamo = new AWS.DynamoDB.DocumentClient();
