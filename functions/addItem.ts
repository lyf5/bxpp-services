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
    if (!bodyJSON.path) {
      response = {
        statusCode: 501,
        body: JSON.stringify({message: `No objects to be add.: ${bodyJSON.path}`}),
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      };
      return response;
    }

    var jsonFile = require('jsonfile');
    const tokenProps = jsonFile.readFileSync(`./db/${bodyJSON.contractCreator}/${bodyJSON.contractID}`);

    const index = tokenProps.findIndex(item => item.image === `https://ipfs.io/ipfs/${bodyJSON.path}`); // query data for tokenpath(IPFS HASH) in local db.
    if (index !== -1) {
      console.log("for debug. index ", index);
      response = {
        statusCode: 502,
        body: JSON.stringify({message: `IPFS hash ${bodyJSON.path} is already exist in localdb!`}),
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      };
      return response;
    }

    const mintPrice = '0.01'
    const NFTMetadata = []
    
    NFTMetadata.push({
      id: "-1",
      mintPrice: mintPrice,
      description: "",
      external_url: "",
      image: `https://ipfs.io/ipfs/${bodyJSON.path}`,
      name: "",
      attributes: [
        {
          "trait_type": "Base", 
          "value": "Starfish"
        }, 
        {
          "trait_type": "Eyes", 
          "value": "Big"
        }, 
        {
          "trait_type": "Mouth", 
          "value": "Surprised"
        }, 
      ],
    })
  
    const content = `${JSON.stringify([...tokenProps, ...NFTMetadata])}`

    const file = path.resolve(__dirname, '../', `../db/${bodyJSON.contractCreator}/${bodyJSON.contractID}`)
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
