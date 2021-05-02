# My_Auction_App

This app is built with the Microservices Architecture approach.

## Tools

- AWS CloudFormation
- AWS DynamoDB
- AWS CloudWatch
- AWS IAM
- AWS S3
- AWS SQS
- AWS API Gateway
- AWS EventBridge
- Middy

## Microservices

- **Authorization Microservice:** uses jwt tokens for authorization, Auth0 for managing signup and signin.
- **Notification Microservice:** uses AWS SES to send emails to a bidder when a bidder wins an auction and also send emails to the seller when their item has been sold.
- **Image Microservice:** uploads auction items images to AWS S3.
- **Auction Backend Microservice:** manages authentication and authorization using the Authorization Microservice, manages the creation of auctions, uploading of auction images to the Image Microservice, manages the placement of bids, the processing of the bids and sending of emails with AWS SQS to the Notification Microservice all with the help of Lambda functions.
