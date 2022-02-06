import { deleteCharacterType, getCharacterType, getCharacterTypes, modifyCharacterType, saveCharacterType } from '../services/CharacterType.service';
import { APIGatewayProxyEvent, APIGatewayProxyEventQueryStringParameters, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Request event: ', _event);
    let response;
    // const requestBody = JSON.parse(_event.body || '');
    switch (true) {
      case _event.httpMethod === 'GET':
        response = await getCharacterType('1');
        break;
      case _event.httpMethod === 'POST':
        response = await saveCharacterType(JSON.parse(_event.body || ''));
        break;
      case _event.httpMethod === 'PATCH':
        response = await modifyCharacterType('1', 'old', '17');
        break;
      case _event.httpMethod === 'DELETE':
        response = await deleteCharacterType(JSON.parse(_event.body|| '').id);
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
