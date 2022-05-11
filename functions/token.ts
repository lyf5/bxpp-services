import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { tokenProps } from '../db/index'

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
        if (
            event.pathParameters?.id &&
            event.pathParameters?.id.length > 0 &&
            !JSON.stringify(tokenProps[tokenProps.findIndex(item => item.id === event.pathParameters.id)])
          ) {
            response = {
                statusCode: 501,
                body: JSON.stringify({ message: 'Token no found!'}),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
            };
            return response;
          }

        response = {
            statusCode: 200,
            body: 
                event.pathParameters?.id && event.pathParameters?.id.length > 0
                ? JSON.stringify(tokenProps[tokenProps.findIndex(item => item.id === event.pathParameters.id)])
                : JSON.stringify(tokenProps),
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
