import { dynamo } from '../common/config/dynamo';
import { characterType } from './../common/constants/table';
import { v4 as uuid} from 'uuid';

export async function getCharacterType(characterTypeId) {
  const params = {
    TableName: characterType,
    Key: {
      'id': characterTypeId,
    }
  };
  return await dynamo.get(params).promise().then((response) => {
    return buildResponse(200, response.Item);
  }, err => {
    console.error('Err...: ', err);
  });
}

export async function scanDynamoRecords(scanParams, arrayItem) {
  try {
    const data = await dynamo.scan(scanParams).promise();
    arrayItem = arrayItem.concat(data.Items);
    if (data.LastEvaluatedKey) {
      scanParams.ExclusiveStartKey = data.LastEvaluatedKey;
      return await scanDynamoRecords(scanParams, arrayItem);
    }
    return arrayItem;
  } catch (err) {
    console.error('Err...: ', err);
  }
}

export async function getCharacterTypes() {
  const params = {
    TableName: characterType,
  };
  const allCharacterTypes = await scanDynamoRecords(params, []);
  const body = {
    characterTypes: allCharacterTypes,
  };
  return buildResponse(200, body);
}


export async function modifyCharacterType(characterTypeId, updateKey, updateValue) {
  const params = {
    TableName: characterType,
    Key: {
      'id': characterTypeId
    },
    UpdateExpression: `set ${updateKey} = :value`,
    ExpressionAttributeValues: {
      ':value': updateValue
    },
    ReturnValues: 'UPDATED_NEW'
  };
  return await dynamo.update(params).promise().then((response) => {
    const body = {
      Operation: 'UPDATE',
      Message: 'SUCCESS',
      UpdatedAttributes: response
    };
    return buildResponse(200, body);
  }, (error) => {
    console.error('Do your custom error handling here. I am just gonna log it: ', error);
  });
}

export async function deleteCharacterType(characterTypeId) {
  const params = {
    TableName: characterType,
    Key: {
      'id': characterTypeId
    },
    ReturnValues: 'ALL_OLD'
  };
  return await dynamo.delete(params).promise().then((response) => {
    const body = {
      Operation: 'DELETE',
      Message: 'SUCCESS',
      Item: response
    };
    return buildResponse(200, body);
  }, (error) => {
    console.error('Do your custom error handling here. I am just gonna log it: ', error);
  });
}

export async function saveCharacterType(requestBody){
  const params = {
    TableName: characterType,
    Item: {
      id: uuid(),
      code: requestBody.code||'',
      name: requestBody.name||'',
      description: requestBody.description||'',
    }
  };
  return await dynamo.put(params).promise().then(() => {
    const body = {
      Operation: 'SAVE',
      Message: 'SUCCESS',
      Item: params.Item
    };
    return buildResponse(200, body);
  }, (error) => {
    console.error('Do your custom error handling here. I am just gonna log it: ', error);
  });
}

export function buildResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  };
}
