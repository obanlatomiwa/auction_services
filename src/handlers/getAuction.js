import AWS from "aws-sdk";
import commonMiddleware from "../utils/commonMiddleware";
import createError from "http-errors";

// initiating AWS DynamoDB
const DynamoDB = new AWS.DynamoDB.DocumentClient();

export async function getAuctionById(id) {
  let auction;

  try {
    const result = await DynamoDB.get({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id },
    }).promise();

    auction = result.Item;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
  if (!auction) {
    throw new createError.NotFound(`Auction with ${id} not found`);
  }

  return auction;
}

async function getAuction(event, context) {
  const { id } = event.pathParameters;
  console.log(id);
  //  send the result to AWS DynamoDB
  const result = await getAuctionById(id);

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
}

export const handler = commonMiddleware(getAuction);
