import AWS from "aws-sdk";
import createError from "http-errors";
import validator from "@middy/validator";
import { getAuctionById } from "./getAuction";
import placeBidSchema from "../utils/schemas/placeBidSchema";
import commonMiddleware from "../utils/commonMiddleware";

// initiating AWS DynamoDB
const DynamoDB = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const { email } = event.requestContext.authorizer;
  const auction = await getAuctionById(id);

  // validate bidder identity
  if (email === auction.seller) {
    throw new createError.Forbidden(`Your can't make a bid for your auction`);
  }

  // avoid double bid
  if (email === auction.highestBid.bidder) {
    throw new createError.Forbidden(`Your are currently the highest bidder`);
  }

  // validate auction
  if (auction.status === "CLOSED") {
    throw new createError.Forbidden(`You can't bid on closed Auctions`);
  }

  // validate bid
  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(
      `Your bid must be highet than ${auction.highestBid.amount}`
    );
  }
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression:
      "set highestBid.amount = :amount, highestBid.bidder = :bidder",
    ExpressionAttributeValues: { ":amount": amount, ":bidder": email },
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

export const handler = commonMiddleware(placeBid).use(
  validator({ inputSchema: placeBidSchema })
);
