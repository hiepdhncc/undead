import { dynamo } from '../common/config/dynamo';
import { characterType, itemType } from './../common/constants/table';
import { v4 as uuid } from 'uuid';


export async function getItemType(itemTypeId) {
  const params = {
    TableName: itemType,
    Key: {
      'id': itemTypeId,
    }
  };
  return await dynamo.get(params).promise().then((response) => {
    return buildResponse(200, response.item);
  }, err => {
    console.error('Err...: ', err);
  });
}

export async function scanDynamoRecords(scanParams, arrayItem) {
  try {
    const data = await dynamo.scan(scanParams).promise();
    arrayItem = arrayItem.concat(data.items);
    if (data.LastEvaluatedKey) {
      scanParams.ExclusiveStartKey = data.LastEvaluatedKey;
      return await scanDynamoRecords(scanParams, arrayItem);
    }
    return arrayItem;
  } catch (err) {
    console.error('Err...: ', err);
  }
}

export async function getItemTypes() {
  const params = {
    TableName: itemType,
  };
  const allItemTypes = await scanDynamoRecords(params, []);
  const body = {
    itemTypes: allItemTypes,
  };
  return buildResponse(200, body);
}


export async function modifyItemType(itemTypeId, updateKey, updateValue) {
  const params = {
    TableName: itemType,
    Key: {
      'id': itemTypeId
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

export async function deleteItemType(itemTypeId) {
  const params = {
    TableName: itemType,
    Key: {
      'id': itemTypeId
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

export async function saveItemType(requestBody){
  const params = {
    TableName: itemType,
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
