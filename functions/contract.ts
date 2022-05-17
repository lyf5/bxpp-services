import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { tokenProps } from './db'
const fs = require('fs');

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
    var allContractList = [];
    try {
        const userAddressList = fs.readdirSync("./db");
        if ( !event.pathParameters?.id ) {
            
            userAddressList.forEach(userAddress => {
                const userContractList = fs.readdirSync("./db/" + userAddress);
                allContractList.push({userAddress, userContractList});
            });
            response = {
                statusCode: 200,
                body: JSON.stringify(allContractList),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
            };
        } else {
            if ( !userAddressList.find(item => item === event.pathParameters.id) ) {
                response = {
                    statusCode: 511,
                    body: JSON.stringify({
                        message: 'User account no exist!',
                    }),
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                    },
                }
            } else {
                const userContractList = fs.readdirSync("./db/" + event.pathParameters.id);
                response = {
                    statusCode: 200,
                    body: JSON.stringify(userContractList),
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                    },
                }
            }
        }      
    } catch (err) {
        console.log(err);
        response = {
            statusCode: 510,
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
