import { dynamo } from '../common/config/dynamo';
import { characterType, weapon } from './../common/constants/table';
import { v4 as uuid } from 'uuid';


export async function getWeapon(weaponId) {
  const params = {
    TableName: weapon,
    Key: {
      'id': weaponId,
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

export async function getWeapons() {
  const params = {
    TableName: weapon,
  };
  const allWeapons = await scanDynamoRecords(params, []);
  const body = {
    weapons: allWeapons,
  };
  return buildResponse(200, body);
}


export async function modifyWeapon(weaponId, updateKey, updateValue) {
  const params = {
    TableName: weapon,
    Key: {
      'id': weaponId
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

export async function deleteWeapon(weaponId) {
  const params = {
    TableName: weapon,
    Key: {
      'id': weaponId
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

export async function saveWeapon(requestBody){
  const params = {
    TableName: weapon,
    Item: {
      id: uuid(),
      weapon_type_id: requestBody.weaponTypeId,
      code: requestBody.code||'',
      name: requestBody.name||'',
      description: requestBody.description||'',
      fire_rate_type: requestBody.fireRateType||'',
      ammo_id: requestBody.ammo_id,
      skin_id: requestBody.skin_id,
      range: requestBody.range,
      dropstart: requestBody.dropstart,
      drop_per_m: requestBody.drop_per_m,
      magazine: requestBody.magazine,
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
