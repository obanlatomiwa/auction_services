import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";

// initiating AWS DynamoDB
const DynamoDB = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  const { title } = JSON.parse(event.body);
  const date = new Date();
  const auction = {
    id: uuid(),
    title,
    status: "OPEN",
    createdAt: date.toISOString(),
  };

  //  send the result to AWS DynamoDB
  await DynamoDB.put({
    TableName: 'AuctionsTable',
    Item: auction,
  }).promise();

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

export const handler = createAuction;
