import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register'
import fetch from 'node-fetch'
import IpfsClient from 'ipfs-http-client'

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
    try {
        const { objectsToBeMinted } = JSON.parse(event.body)
      
        if (!objectsToBeMinted) {
          // throw new Error('No objects to be minted')

          response = {
            statusCode: 501,
            body: JSON.stringify([{message: "No objects to be minted"},{message2: objectsToBeMinted}]),
            headers: {
              'Access-Control-Allow-Origin': '*',
            },
          };

          return response;
        }
        
        const client = IpfsClient({
          host: process.env.REACT_APP_HOST,
          port: Number(process.env.REACT_APP_PORT),
          protocol: process.env.REACT_APP_PROTOCOL,
          headers: {
            authorization: `Basic ${Buffer.from(
              `${process.env.REACT_APP_PROJECT_ID}:${process.env.REACT_APP_PROJECT_SECRET}`
            ).toString('base64')}`,
          },
        });
    
        const objectsIPFS: string[] = await Promise.all(
          objectsToBeMinted.map(async name => {
            try {

              const buffertemp = await (
                await fetch(
                  `https://robohash.org/${name}.png`
                )
              ).arrayBuffer()

              const buffer = Buffer.from(buffertemp, 'base64');     
              const { path } = await client.add({content: buffer});

              /*
              response = {
                statusCode: 201,
                body: JSON.stringify(path),
                headers: {
                  'Access-Control-Allow-Origin': '*',
                },
              };
              return response;
              */
              
              console.log("path, name: ", path, name);
              return { path, name }

            } catch (e) {
              console.log(e);
              response = {
                statusCode: 502,
                body: JSON.stringify(e),
                headers: {
                  'Access-Control-Allow-Origin': '*',
                },
              };
    
              return response;
            }
          })
        )
        response = {
            statusCode: 200,
            body: JSON.stringify(objectsIPFS),
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
