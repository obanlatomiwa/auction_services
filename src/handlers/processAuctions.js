import createError from "http-errors";
import { getEndedAuctions } from "../utils/getEndedAuctions";
import { closeAuction } from "../utils/closeAuction";

async function processAuctions(event, context) {
  try {
    // an array of auctions to close
    const auctionsToClose = await getEndedAuctions();

    // auctions promises
    const auctionPromises = auctionsToClose.map((auction) =>
      closeAuction(auction)
    );
    await Promise.all(auctionPromises);
    return { closed: auctionPromises.length };
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = processAuctions;
