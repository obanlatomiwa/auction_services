import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import validator from "@middy/validator";
import createError from "http-errors";
import { getAuctionById } from "./getAuction";
import { uploadPictureToS3 } from "../utils/uploadPictureToS3";
import { setAuctionPictureUrl } from "../utils/uploadAuctionPictureUrl";
import uploadPictureSchema from "../utils/schemas/uploadPictureSchema";

export async function uploadAuctionPictureToS3(event) {
  const { id } = event.pathParameters;
  const { email } = event.requestContext.authorizer;
  const auction = await getAuctionById(id);

  // validate seller, before uploading image
  if (auction.seller !== email) {
    throw new createError.Forbidden(
      `You don't own this auction. Contact the owner at ${email}.`
    );
  }

  const base64 = event.body.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");

  let updatedAuction;
  try {
    const imageUrl = await uploadPictureToS3(auction.id + ".jpeg", buffer);
    updatedAuction = await setAuctionPictureUrl(auction.id, imageUrl);
    console.log(imageUrl);
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
}

export const handler = middy(uploadAuctionPictureToS3).use(
  httpErrorHandler()
);
