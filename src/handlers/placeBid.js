import AWS from "aws-sdk";
import commonMiddleware from "../utils/commonMiddleware";
import createError from "http-errors";
import { getAuctionById } from "./getAuction";

// initiating AWS DynamoDB
const DynamoDB = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;

  const auction = await getAuctionById(id);

  if (auction.status === 'CLOSED') {
    throw new createError.Forbidden(`You can't bid on closed Auctions`)
  }
  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(
      `Your bid must be highet than ${auction.highestBid.amount}`
    );
  }
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: "set highestBid.amount = :amount",
    ExpressionAttributeValues: { ":amount": amount },
    ReturnValues: "ALL_NEW",
  };

  //  send the result to AWS DynamoDB
  let updatedAuction;
  try {
    const result = await DynamoDB.update(params).promise();
    updatedAuction = result.Attributes;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
}

export const handler = commonMiddleware(placeBid);
