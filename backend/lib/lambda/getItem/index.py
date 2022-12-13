import os
import urllib.parse
import boto3

tableName = os.environ["TABLE_NAME"]

dynamoDB = boto3.resource("dynamodb")
table = dynamoDB.Table(tableName)


def handler(event, context):
    id = event["pathParameters"]["id"]
    res = table.get_item(Key={"id": id})

    url = res["Item"]["long_url"]
    query = event["queryStringParameters"]
    if query is not None:
        q = urllib.parse.urlencode(query)
        url = url + "?" + q

    response = {
        "statusCode": 302,
        "headers": {"Location": url},
    }
    return response
