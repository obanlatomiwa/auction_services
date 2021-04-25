import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
import commonMiddleware from "../utils/commonMiddleware";
import createError from "http-errors";

// initiating AWS DynamoDB
const DynamoDB = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  const { title } = event.body;
  const date = new Date();
  const endDate = new Date();
  endDate.setHours(date.getHours() + 1);
  
  const auction = {
    id: uuid(),
    title,
    status: "OPEN",
    createdAt: date.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0,
    },
  };

  //  send the result to AWS DynamoDB
  try {
    await DynamoDB.put({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Item: auction,
    }).promise();
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

export const handler = commonMiddleware(createAuction);
