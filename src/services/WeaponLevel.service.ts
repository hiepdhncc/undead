import { weaponLevel } from "../common/constants/table";

const dynamo = require('../config/dynamo')
const table = require('../constants/table');
const { v4: uuid } = require('uuid');


export async function getWeaponLevel(weaponLevelId) {
  const params = {
    TableName: weaponLevel,
    Key: {
      'id': weaponLevelId,
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
    arrayItem = arrayItem.concat(data.items);
    if (data.LastEvaluateKey) {
      scanParams.ExclusiveStartKey = data.LastEvaluateKey;
      return await scanDynamoRecords(scanParams, arrayItem);
    }
    return arrayItem;
  } catch (err) {
    console.error('Err...: ', err);
  }
}

export async function getWeaponLevels() {
  const params = {
    TableName: weaponLevel,
  };
  const allWeaponLevels = await scanDynamoRecords(params, []);
  const body = {
    weaponLevels: allWeaponLevels,
  };
  return buildResponse(200, body);
}


export async function modifyWeaponLevel(weaponLevelId, updateKey, updateValue) {
  const params = {
    TableName: weaponLevel,
    Key: {
      'id': weaponLevelId
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

export async function deleteWeaponLevel(weaponLevelId) {
  const params = {
    TableName: weaponLevel,
    Key: {
      'id': weaponLevelId
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

export async function saveWeaponLevel(requestBody){
  const params = {
    TableName: weaponLevel,
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

module.exports = {saveWeaponLevel, deleteWeaponLevel, getWeaponLevel, getWeaponLevels, modifyWeaponLevel};