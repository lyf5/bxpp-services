import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register'
import { tokenProps } from '../db'
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
  const res = JSON.parse(event.body);
  console.log("for debug. res: ", res);
  try {
      
    if (!res.index) {
      response = {
        statusCode: 501,
        body: JSON.stringify({message: `No objects to be update. Index is null! ${res.index}`}),
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      };
      return response;
    }
    
    const index = tokenProps.findIndex(item => item.image == res.tokenpath); // query data for tokenpath(IPFS HASH) in local db.
    if (index === -1) {
      response = {
        statusCode: 502,
        body: JSON.stringify({message: `No objects to be update. ${res.tokenpath} don't exist in localdb!`}),
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      };
      return response;
    }
    console.log("for debug. current id will be updated: ", tokenProps[index].id, res.index);

    console.log("for debug. old content: ", tokenProps);
    tokenProps[index].id = res.index;
    tokenProps[index].description = `Description for BXPP ${res.index}`,
    tokenProps[index].external_url = `https://bxpp.io/${res.index}`,
    tokenProps[index].name = `BXPP ${res.index}`,

    console.log("for debug. new content: ", tokenProps);

    const content = `export const tokenProps = ${JSON.stringify(tokenProps)}`
    
    const file = path.resolve(__dirname, '../', '../db/', 'index.ts')
    console.log("for debug. file: ", file);
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
