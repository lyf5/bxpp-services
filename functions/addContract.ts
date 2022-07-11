import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
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
    if (event.body === null) return null
    try {
        const bodyJSON = JSON.parse(event.body)
        console.log("for debug. bodyJSON ", bodyJSON);

        const filedir = path.resolve(__dirname, '../', `../db/${bodyJSON.contractCreator}`)
        console.log("for debug. filedir ", filedir);

        try { 
            fs.accessSync(filedir, fs.constants.F_OK); 
            console.log('for debug. File does exist'); 
          } catch (err) { 
            console.error('for debug. File does not exist, make it.'); 
            fs.mkdirSync(filedir);
          }

        const filePath = path.resolve(__dirname, '../', `../db/${bodyJSON.contractCreator}/${bodyJSON.contractID}`)
        console.log("for debug. filePath ", filePath);

        fs.closeSync(fs.openSync(filePath, 'a'))

        response = {
            statusCode: 200,
            body: 
                JSON.stringify(filePath),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        };
    } catch (err) {
        console.log(err);
        response = {
            statusCode: 500,
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
