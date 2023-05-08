import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb"); // CommonJS import
const client = new DynamoDBClient({ region: "us-east-1" });

export const loginuser = async (event) => {
  const body = JSON.parse(event.body);
  const username = body.username;
  const password = body.password;
  const userqueryparams = {
    TableName: process.env.DynamoDB_TableName,
    Key: {
      username: {
        S: username,
      },
    },
  };
  let userResult = {};
  try {
    const command = new GetItemCommand(userqueryparams);
    const response = await client.send(command);
    userResult = response;
    if (userResult.Item) {
      let comparePassword = bcryptjs.compareSync(
        password,
        userResult.Item.password.S
      );
      if (comparePassword) {
        const token = await jwt.sign(
          { username: userResult.Item.username.S },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        console.log(token);
        return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
            "Access-Control-Allow-Headers": "Authorization",
          },
          body: JSON.stringify({
            msg: "User logged in successfully",
            token: token,
          }),
        };
      } else {
        return "comparepassword failed";
      }
    } else {
      return "Item Not Found";
    }
  } catch (err) {
    console.log(err);
    return new Error("There is a error while logging user");
  }
};
