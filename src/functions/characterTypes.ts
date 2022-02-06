import { getCharacterType, getCharacterTypes } from '../services/CharacterType.service';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Request event: ', _event);
    let response;
    switch (true) {
      case _event.httpMethod === 'GET':
        response = await getCharacterTypes();
        break;
    }
    return response;
  } catch (err) {
    return {
      statusCode: 500,
      body: 'An error occurred',
    };
  }
};
