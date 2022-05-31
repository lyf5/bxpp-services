import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register'
import path from 'path';
import fs from 'fs';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  let response: APIGatewayProxyResult;
  const bodyJSON = JSON.parse(event.body)
  console.log("for debug. bodyJSON ", bodyJSON);
  
  try {
    if (!bodyJSON.imagePath) {
      response = {
        statusCode: 501,
        body: JSON.stringify({message: `No item coule be delete. ${bodyJSON.imagePath}`}),
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      };
      return response;
    }

    var jsonFile = require('jsonfile');
    const tokenProps = jsonFile.readFileSync(`./db/${bodyJSON.contractCreator}/${bodyJSON.contractID}`);
    
    const index = tokenProps.findIndex(item => item.image === `${bodyJSON.imagePath}`); // query data for tokenpath(IPFS HASH) in local db.
    if (index === -1) {
      response = {
        statusCode: 502,
        body: JSON.stringify({message: `IPFS hash ${bodyJSON.imagePath} no found in localdb!`}),
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      };
      return response;
    }

    console.log("for debug. index: ", index);
    console.log("for debug. old content: ", tokenProps);
    const resule = tokenProps.filter(item => {return item.image !== `${bodyJSON.imagePath}`});
    console.log("for debug. new content: ", resule);

    const content = `export const tokenProps = ${JSON.stringify(resule)}`;

    const file = path.resolve(__dirname, '../', '../db/', 'index.ts')
    // console.log("for debug. file: ", file);
    await fs.writeFileSync(file, content)

    response = {
        statusCode: 200,
        body: JSON.stringify("OK"),
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
    };
  } catch (err) {
      console.log(err);
      response = {
          statusCode: 503,
          body: JSON.stringify({
              message: 'some error happened',
          }),
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
      };
  }

  return response;
};
