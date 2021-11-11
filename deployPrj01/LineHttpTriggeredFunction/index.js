//https://github.com/line/line-bot-sdk-nodejs/tree/next/examples/echo-bot
//https://himanago.hatenablog.com/entry/2020/04/23/205202
'use strict';
const Obniz = require("obniz");
const fetch = require('node-fetch');
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
   //const echo = { type: 'text', text: "頑張ったね！"};

   const echo =
   [
    {
        "type":"text",
        "text":"頑張ったね！"
    },
    {
      type: 'image',
      originalContentUrl: `https://fnstordmitcuzkwafv7xgh7a.blob.core.windows.net/files/dere.png`,
      previewImageUrl: `https://fnstordmitcuzkwafv7xgh7a.blob.core.windows.net/files/dere.png`
    },
    {
      type: 'audio',
      originalContentUrl: `https://fnstordmitcuzkwafv7xgh7a.blob.core.windows.net/files/ganbattane.mp3`,
      duration: 60000
    }
]

   //obniz

   var obniz = new Obniz("29240510");
      var connected = await obniz.connectWait({timeout:10});
      
      if (connected){
      var servo = obniz.wired("ServoMotor", {gnd:0,vcc:1,signal:2});
      servo.angle(10.0); // half position
      await obniz.wait(500);
      servo.angle(100.0); // half position
      await obniz.wait(500);
      servo.angle(10.0); // half position
      await obniz.wait(500);
      servo.angle(100.0); // half position
      await obniz.wait(500);
      servo.angle(10.0); // half position
      await obniz.wait(500);
      servo.angle(100.0); // half position
      await obniz.wait(500);
      servo.angle(10.0); // half position
      await obniz.wait(500);
      servo.angle(100.0); // half position
      servo.off();
      obniz.close();}




   // use reply API
   return client.replyMessage(event.replyToken, echo);
  } 
  else if (event.postback.data ===  'no') {

          // create a echoing text message
   //const echo = { type: 'text', text: "しっかりして！"};
   const echo =
   [
    {
        "type":"text",
        "text":"しっかりしなさい！"
    },
    {
      type: 'image',
      originalContentUrl: `https://fnstordmitcuzkwafv7xgh7a.blob.core.windows.net/files/tsun.png`,
      previewImageUrl: `https://fnstordmitcuzkwafv7xgh7a.blob.core.windows.net/files/tsun.png`
    },
    {
      type: 'audio',
      originalContentUrl: `https://fnstordmitcuzkwafv7xgh7a.blob.core.windows.net/files/sikkarisinasai.mp3`,
      duration: 60000
    }
]

   // use reply API
   return client.replyMessage(event.replyToken, echo);
    
  
  } 
    
  
  } else if (event.message.type === 'text') {

    let message = event.message.text.split("\n");
    　 var registerflag = message[0];
       var registertime = message[1];
       var registerschedule = message[2];

    if (registerflag === '登録') {

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
  "id": uuidv4(),
  "category": "schedule",
  "time": registertime ,
  "userId":event.source.userId,
  "description": registerschedule ,
  "audio": "https://fnstordmitcuzkwafv7xgh7a.blob.core.windows.net/files/hamigaki.mp3" 
};

  //  </DefineNewItem>
    // <CreateItem>
    /** Create new item
     * newItem is defined at the top of this file
     */
     const { resource: createdItem } = await container.items.create(newItem);
    
     // </CreateItem>
     //ここまでDBへの登録

  //const echo = { type: 'text', text: "登録したよ！"};
  const echo =
  [
    {
        "type":"text",
        "text":"登録したよ！"
    },
    {
      type: 'image',
      originalContentUrl: `https://fnstordmitcuzkwafv7xgh7a.blob.core.windows.net/files/touroku.png`,
      previewImageUrl: `https://fnstordmitcuzkwafv7xgh7a.blob.core.windows.net/files/touroku.png`
    }
];
  // use reply API
  //client.replyMessage(event.replyToken, echo);
  return client.replyMessage(event.replyToken, echo);
    }
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
    blockBlobClient.upload('test',4);
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






  // 音声合成 WebAPI の URL
	const url = "https://webapi.aitalk.jp/webapi/v5/ttsget.php"

	const params = {
		'username': 'Happy-4-Hack-Day',
		'password': 'Ht57e4y6',
		'input_type': 'text',
		'text': '変数',
		'ext': 'mp3',
		'speaker_name': 'akane_west_emo',
		'volume': '1.0',
		'speed': '1.0',
		'pitch': '1.0',
		'range': '1.0',
		'epause': '800'
	};


	// パラメータを application/x-www-form-urlencoded の形式にする
	const requestBody = Object.keys(params).map((key) => {
		return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
	}).join('&');

	// リクエスト実行
	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: requestBody
	})
	.then(response => response.blob())
	.then((blob) => {
	// 	// // エーアイの WebAPI は、音声データを作成するサービスです。
	// 	// // 音声データの再生やファイル保存する際は、他のサービスをご利用ください。
	// 	// // この例では、JavaScript の機能を利用して再生します。

	// 	// const fileArea = document.getElementById('file-area');
	// 	// const audio_element = document.createElement('audio');
	// 	// if (fileArea.hasChildNodes()){
	// 	// 	fileArea.removeChild(fileArea.firstChild);
	// 	// }
	// 	// audio_element.src = URL.createObjectURL(data);
	// 	// audio_element.play();
	// 	// audio_element.controls = true;
	// 	// fileArea.appendChild(audio_element);

    const blobName = uuidv4() + '.mp3'
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    //const audiodata = await getStreamData(data);
    blockBlobClient.upload(blob,blob.size);
    //blockBlobClient.uploadData(blob);  
		
		// 必要に応じて、revokeObjectURL を呼び出してください。
	});



  // const echo = { type: 'text', text: "test中"};
  // use reply API
  //return client.replyMessage(event.replyToken, echo);
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