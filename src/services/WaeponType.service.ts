import { dynamo } from '../common/config/dynamo';
import { characterType, weaponType } from './../common/constants/table';
import { v4 as uuid } from 'uuid';


export async function getWeaponType(WeaponTypeId) {
  const params = {
    TableName: weaponType,
    Key: {
      'id': WeaponTypeId,
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

export async function getWeaponTypes() {
  const params = {
    TableName: weaponType,
  };
  const allWeaponTypes = await scanDynamoRecords(params, []);
  const body = {
    weaponTypes: allWeaponTypes,
  };
  return buildResponse(200, body);
}


export async function modifyWeaponType(weaponTypeId, updateKey, updateValue) {
  const params = {
    TableName: weaponType,
    Key: {
      'id': weaponTypeId
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

export async function deleteWeaponType(weaponTypeId) {
  const params = {
    TableName: weaponType,
    Key: {
      'id': weaponTypeId
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

export async function saveWeaponType(requestBody){
  const params = {
    TableName: weaponType,
    Item: {
      id: uuid(),
      code: requestBody.code||'',
      name: requestBody.name||''
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
