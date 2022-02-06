import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Request event: ', _event);
    let response = {
      statusCode: 200,
      body: 'HELLO YOU ARE MY FRIEND!!!',
    };
    const requestBody = JSON.parse(_event.body|| '');
    switch (true) {
      default:
        return response;
    }
    // return response;
  } catch (err) {
    return {
      statusCode: 500,
      body: 'An error occurred',
    };
  }
};
