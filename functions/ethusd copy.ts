import { APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
import fetch from 'node-fetch'

const ethusd: APIGatewayProxyHandler = async (_event, _context) => {
  try {
    const { APIETHERSCAN } = process.env

    const quote = await (
      await fetch(
        `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=IUACDEMEC418NZZ3RXU5ZRQ67UXVFM5IR8`
      )
    ).json()

    console.log("quote:", quote);

    return {
      statusCode: 200,
      body: JSON.stringify(quote),
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }
  } catch (e) {
    console.log(e, process.env.APIETHERSCAN )

    return {
      statusCode: 500,
      body: JSON.stringify(e),
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }
  }
}

export default ethusd
