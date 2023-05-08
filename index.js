import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
const bcryptjs = require("bcryptjs");
// const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb"); // CommonJS import
const client = new DynamoDBClient({ region: "us-east-1" });

export const createuser = async (event) => {
  const body = JSON.parse(event.body);
  const username = body.username;
  const password = body.password;
  const newUser = {
    TableName: process.env.DynamoDB_TableName,
    Item: {
      username: { S: username },
      password: { S: bcryptjs.hashSync(password, 10) },
    },
  };
  try {
    const command = new PutItemCommand(newUser);
    const response = await client.send(command);
    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "Authorization",
      },
    };
  } catch (err) {
    console.log(err);
    return new Error("There is a error while creating a new user");
  }
};

// export const handler = async(event) => {
//   // TODO implement
//   const response = {
//       statusCode: 200,
//       body: JSON.stringify('Hello from Lambda!'),
//   };
//   return response;
// };
