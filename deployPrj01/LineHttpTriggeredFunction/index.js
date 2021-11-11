//https://github.com/line/line-bot-sdk-nodejs/tree/next/examples/echo-bot
//https://himanago.hatenablog.com/entry/2020/04/23/205202
'use strict';
// @ts-check DB関連の設定
//  <ImportConfiguration>
const CosmosClient = require("@azure/cosmos").CosmosClient;
const configDB = require("./config");
const dbContext = require("./data/databaseContext");
//  </ImportConfiguration>

//ここまでDB関連の設定

const line = require('@line/bot-sdk');
const createHandler = require("azure-function-express").createHandler;
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { BlobServiceClient } = require("@azure/storage-blob");
const { getStreamData } = require('./helpers/stream.js'); 

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient('files');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/api/linehttptriggeredfunction', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
async function handleEvent(event) {
  if (event.type !== 'message' && event.type !== 'postback') {
    // ignore non-text-message event
    return Promise.resolve(null);
  } else if (event.type === 'postback') {
    if (event.postback.data === 'sticker') {
      //https://developers.line.biz/ja/reference/messaging-api/#sticker-message
      //https://developers.line.biz/ja/docs/messaging-api/sticker-list/#sticker-definitions
      return client.replyMessage(event.replyToken,{
        type: 'sticker',
        packageId: "11537",
        stickerId: "52002735"
      });
    }
    else if (event.postback.data ===  'yes') {

      // create a echoing text message
   const echo = { type: 'text', text: "頑張ったね！"};

   // use reply API
   return client.replyMessage(event.replyToken, echo);
  } 
  else if (event.postback.data ===  'no') {

          // create a echoing text message
   const echo = { type: 'text', text: "しっかりして！"};

   // use reply API
   return client.replyMessage(event.replyToken, echo);
    
  
  } 
    
  
  } else if (event.message.type === 'text') {
    if (event.message.text === 'flex') {
      //https://developers.line.biz/ja/reference/messaging-api/#flex-message
      return client.replyMessage(event.replyToken,{
        type: 'flex',
        altText: 'item list',
        contents: flexMsg
      });
    } else if (event.message.text === 'quick') {
      //https://developers.line.biz/ja/reference/messaging-api/#quick-reply
      return client.replyMessage(event.replyToken,{
        type: 'text',
        text: 'ステッカー欲しいですか❓YesかNoで答えてください, もしくは素敵な写真送って❗️',
        "quickReply": {
          "items": [
            {
              "type": "action",
              "action": {
                "type":"postback",
                "label":"Yes",
                "data": "sticker",
                "displayText":"ステッカーください❗️"
              }
            },
            {
              "type": "action",
              "action": {
                "type":"message",
                "label":"No",
                "text":"不要。"
              }
            },
            {
              "type": "action",
              "action": {
                "type": "camera",
                "label": "camera"
              }
            }
          ]
        }
      });
    }

  } else if (event.message.type === 'image') {
    //https://developers.line.biz/ja/reference/messaging-api/#image-message
    const blobName = uuidv4() + '.jpg'
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const stream = await client.getMessageContent(event.message.id);
    const data = await getStreamData(stream);
    blockBlobClient.uploadData(data);
    return client.replyMessage(event.replyToken,{
      type: 'image',
      originalContentUrl: `https://${blobServiceClient.accountName}.blob.core.windows.net/files/${blobName}`,
      previewImageUrl: `https://${blobServiceClient.accountName}.blob.core.windows.net/files/${blobName}`
    });
  } else if (event.message.type === 'audio') {
    //https://developers.line.biz/ja/reference/messaging-api/#audio-message
    //durationはこれでとれそう？ > https://www.npmjs.com/package/mp3-duration
    const blobName = uuidv4() + '.mp3'
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const stream = await client.getMessageContent(event.message.id);
    const data = await getStreamData(stream);
    const res = blockBlobClient.uploadData(data);
    return client.replyMessage(event.replyToken,{
      type: 'audio',
      originalContentUrl: `https://${blobServiceClient.accountName}.blob.core.windows.net/files/${blobName}`,
      duration: 60000
    });
  } else if (event.message.type === 'location') {
    //https://developers.line.biz/ja/reference/messaging-api/#location-message
    return client.replyMessage(event.replyToken,{
      type: 'location',
      title: 'my location',
      address: event.message.address,
      latitude: event.message.latitude,
      longitude: event.message.longitude
    });
  }
//DBへの接続
  // <CreateClientObjectDatabaseContainer>
  const { endpoint, key, databaseId, containerId } = configDB;

  const clientDB = new CosmosClient({ endpoint, key });

  const database = clientDB.database(databaseId);
  const container = database.container(containerId);

  // Make sure Tasks database is already setup. If not, create it.
  await dbContext.create(clientDB, databaseId, containerId);
  // </CreateClientObjectDatabaseContainer>
  //ここまでDBへの接続

  //DBへ登録
  //  <DefineNewItem>
const newItem = {
    id: "3",
    category: "schedule",
    time: "23:00",
    description: "歯を磨く",
  };
  //  </DefineNewItem>
    // <CreateItem>
    /** Create new item
     * newItem is defined at the top of this file
     */
     const { resource: createdItem } = await container.items.create(newItem);
    
//      // </CreateItem>
//      //ここまでDBへの登録

//      //DBから取得
//     // <QueryItems>
//     console.log(`Querying container: Items`);

    // // query to return all items
    // const querySpec = {
    //   query: "SELECT * from c"
    // };
    
    // // read all items in the Items container
    // const { resources: items } = await container.items
    //   .query(querySpec)
    //   .fetchAll();

    // let getitems = "";
    // items.forEach(item => {
    //   console.log(`${item.id} - ${item.description}`);
    //   getitems =  getitems+item.description;
    // });

  // create a echoing text message
   const echo = { type: 'text', text: event.source.userId};

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

module.exports = createHandler(app);

//https://developers.line.biz/flex-simulator/
const flexMsg = {
  "type": "carousel",
  "contents": [
    {
      "type": "bubble",
      "hero": {
        "type": "image",
        "size": "full",
        "aspectRatio": "20:13",
        "aspectMode": "cover",
        "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_5_carousel.png"
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "spacing": "sm",
        "contents": [
          {
            "type": "text",
            "text": "Arm Chair, White",
            "wrap": true,
            "weight": "bold",
            "size": "xl"
          },
          {
            "type": "box",
            "layout": "baseline",
            "contents": [
              {
                "type": "text",
                "text": "$49",
                "wrap": true,
                "weight": "bold",
                "size": "xl",
                "flex": 0
              },
              {
                "type": "text",
                "text": ".99",
                "wrap": true,
                "weight": "bold",
                "size": "sm",
                "flex": 0
              }
            ]
          }
        ]
      },
      "footer": {
        "type": "box",
        "layout": "vertical",
        "spacing": "sm",
        "contents": [
          {
            "type": "button",
            "style": "primary",
            "action": {
              "type": "uri",
              "label": "Add to Cart",
              "uri": "https://linecorp.com"
            }
          },
          {
            "type": "button",
            "action": {
              "type": "uri",
              "label": "Add to wishlist",
              "uri": "https://linecorp.com"
            }
          }
        ]
      }
    },
    {
      "type": "bubble",
      "hero": {
        "type": "image",
        "size": "full",
        "aspectRatio": "20:13",
        "aspectMode": "cover",
        "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_6_carousel.png"
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "spacing": "sm",
        "contents": [
          {
            "type": "text",
            "text": "Metal Desk Lamp",
            "wrap": true,
            "weight": "bold",
            "size": "xl"
          },
          {
            "type": "box",
            "layout": "baseline",
            "flex": 1,
            "contents": [
              {
                "type": "text",
                "text": "$11",
                "wrap": true,
                "weight": "bold",
                "size": "xl",
                "flex": 0
              },
              {
                "type": "text",
                "text": ".99",
                "wrap": true,
                "weight": "bold",
                "size": "sm",
                "flex": 0
              }
            ]
          },
          {
            "type": "text",
            "text": "Temporarily out of stock",
            "wrap": true,
            "size": "xxs",
            "margin": "md",
            "color": "#ff5551",
            "flex": 0
          }
        ]
      },
      "footer": {
        "type": "box",
        "layout": "vertical",
        "spacing": "sm",
        "contents": [
          {
            "type": "button",
            "flex": 2,
            "style": "primary",
            "color": "#aaaaaa",
            "action": {
              "type": "uri",
              "label": "Add to Cart",
              "uri": "https://linecorp.com"
            }
          },
          {
            "type": "button",
            "action": {
              "type": "uri",
              "label": "Add to wish list",
              "uri": "https://linecorp.com"
            }
          }
        ]
      }
    },
    {
      "type": "bubble",
      "body": {
        "type": "box",
        "layout": "vertical",
        "spacing": "sm",
        "contents": [
          {
            "type": "button",
            "flex": 1,
            "gravity": "center",
            "action": {
              "type": "uri",
              "label": "See more",
              "uri": "https://linecorp.com"
            }
          }
        ]
      }
    }
  ]
}