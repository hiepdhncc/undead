import { dynamo } from '../common/config/dynamo';
import { characterType, userReward } from './../common/constants/table';
import { v4 as uuid } from 'uuid';


export async function getUserReward(userRewardId) {
  const params = {
    TableName: userReward,
    Key: {
      'id': userRewardId,
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

export async function getUserRewards() {
  const params = {
    TableName: userReward,
  };
  const allUserRewards = await scanDynamoRecords(params, []);
  const body = {
    userRewards: allUserRewards,
  };
  return buildResponse(200, body);
}


export async function modifyUserReward(userRewardId, updateKey, updateValue) {
  const params = {
    TableName: userReward,
    Key: {
      'id': userRewardId
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

export async function deleteUserReward(userRewardId) {
  const params = {
    TableName: userReward,
    Key: {
      'id': userRewardId
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

export async function saveUserReward(requestBody){
  const params = {
    TableName: userReward,
    Item: {
      id: uuid(),
      user_id: requestBody.userId||'',
      reward_id: requestBody.rewardId||'',
      is_claimed: requestBody.isClaimed||false,
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
