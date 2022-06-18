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

        await fs.access(filedir, async function(err){
            if(err.code == "ENOENT"){
                console.log("for debug, user no found, create it: ", filedir)
                await fs.mkdirSync(filedir);
            }
        })

        const filePath = path.resolve(__dirname, '../', `../db/${bodyJSON.contractCreator}/${bodyJSON.contractID}`)
        
        const fd = await fs.openSync(filePath, 'a')
        fs.closeSync(fd)

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


/**
 * 判读路径是否存在,如不存在创建文件夹
 * @param pathStr 参数要用path.join()拼接,项目下的相对路径
 * @return projectPath 返回绝对路径,可要可不要
 */
 function mkdirPath(pathStr) {
    var projectPath=path.join(process.cwd());
    var tempDirArray=pathStr.split('\\');
    for (var i = 0; i < tempDirArray.length; i++) {
        projectPath = projectPath+'/'+tempDirArray[i];
        if (fs.existsSync(projectPath)) {
            var tempstats = fs.statSync(projectPath);
            if (!(tempstats.isDirectory())) {
                fs.unlinkSync(projectPath);
                fs.mkdirSync(projectPath);
            }
        }
        else{
            fs.mkdirSync(projectPath);
        }
    }
    return projectPath;
  }
