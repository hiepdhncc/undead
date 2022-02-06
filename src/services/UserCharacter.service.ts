import { dynamo } from '../common/config/dynamo';
import { characterType, userCharacter } from './../common/constants/table';
import { v4 as uuid } from 'uuid';


export async function getUserCharacter(userCharacterId) {
  const params = {
    TableName: userCharacter,
    Key: {
      'id': userCharacterId,
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

export async function getUserCharacters() {
  const params = {
    TableName: userCharacter,
  };
  const allUserCharacters = await scanDynamoRecords(params, []);
  const body = {
    userCharacters: allUserCharacters,
  };
  return buildResponse(200, body);
}


export async function modifyUserCharacter(userCharacterId, updateKey, updateValue) {
  const params = {
    TableName: userCharacter,
    Key: {
      'id': userCharacterId
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

export async function deleteUserCharacter(userCharacterId) {
  const params = {
    TableName: userCharacter,
    Key: {
      'id': userCharacterId
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

export async function saveUserCharacter(requestBody){
  const params = {
    TableName: userCharacter,
    Item: {
      id: uuid(),
      user_id: requestBody.userId || '',
      character_id : requestBody.characterId||''
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

function buildResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  };
}
