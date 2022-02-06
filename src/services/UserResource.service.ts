import { dynamo } from '../common/config/dynamo';
import { characterType, userResource } from './../common/constants/table';
import { v4 as uuid } from 'uuid';


export async function getUserResource(userResourceId) {
  const params = {
    TableName: userResource,
    Key: {
      'id': userResourceId,
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

export async function getUserResources() {
  const params = {
    TableName: userResource,
  };
  const allUserResources = await scanDynamoRecords(params, []);
  const body = {
    userResources: allUserResources,
  };
  return buildResponse(200, body);
}


export async function modifyUserResource(userResourceId, updateKey, updateValue) {
  const params = {
    TableName: userResource,
    Key: {
      'id': userResourceId
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

export async function deleteUserResource(userResourceId) {
  const params = {
    TableName: userResource,
    Key: {
      'id': userResourceId
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

export async function saveUserResource(requestBody){
  const params = {
    TableName: userResource,
    Item: {
      id: uuid(),
      resource_id: requestBody.resourceId||'',
      user_id: requestBody.userId||'',
      value: requestBody.value||0,
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
