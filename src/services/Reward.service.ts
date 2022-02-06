import { dynamo } from '../common/config/dynamo';
import { characterType, reward } from './../common/constants/table';
import { v4 as uuid } from 'uuid';


async function getReward(rewardId) {
  const params = {
    TableName: reward,
    Key: {
      'id': rewardId,
    }
  };
  return await dynamo.get(params).promise().then((response) => {
    return buildResponse(200, response.item);
  }, err => {
    console.error('Err...: ', err);
  });
}

async function scanDynamoRecords(scanParams, arrayItem) {
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

async function getRewards() {
  const params = {
    TableName: reward,
  };
  const allRewards = await scanDynamoRecords(params, []);
  const body = {
    rewards: allRewards,
  };
  return buildResponse(200, body);
}


async function modifyReward(rewardId, updateKey, updateValue) {
  const params = {
    TableName: reward,
    Key: {
      'id': rewardId
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

async function deleteReward(rewardId) {
  const params = {
    TableName: reward,
    Key: {
      'id': rewardId
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

async function saveReward(requestBody){
  const params = {
    TableName: reward,
    Item: {
      id: uuid(),
      is_auto_claim: requestBody.isAutoClaim||false,
      type: requestBody.type||'',
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

function buildResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  };
}

module.exports = {saveReward, deleteReward, getReward, getRewards, modifyReward};