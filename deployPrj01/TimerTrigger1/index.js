 'use strict';
 // @ts-check DB関連の設定
//  <ImportConfiguration>
const CosmosClient = require("@azure/cosmos").CosmosClient;
const configDB = require("./config");
const dbContext = require("./data/databaseContext");
//  </ImportConfiguration>

//ここまでDB関連の設定
module.exports = async function (context, myTimer) {
    var timeStamp = new Date().toISOString();
    
    if (myTimer.isPastDue)
    {
        context.log('JavaScript is running late!');
    }

    context.log('JavaScript timer trigger function ran!', timeStamp); 
    
    //https://developers.line.biz/ja/reference/messaging-api/#send-push-message
const line = require('@line/bot-sdk');

const token = '0SNPpsEPdri95On5F3ZZruJcObqwI+3UGADGZn4IVX96ZdUHcHZq1HCVGEgtaiSzrqhX0SB5GgGXnDRLdE8Rv/oYNzQVtbcFnSbda4xCsd296yzr3TNDrmKAGXZzziFqARfTSf1WlQvQABTwBYHDvwdB04t89/1O/w1cDnyilFU='
const userId2 = 'U568a9510055a2c90105cd5eff2868a78'
const userId1 = 'Uf22a02d8fe3cba898a661e4f8d9abc0b'

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

       //DBから取得
    // <QueryItems>
    console.log(`Querying container: Items`);

    //比較用日付作成
    var date0 = new Date();
var year =  date0.getFullYear().toString();
var month = (date0.getMonth()+1).toString();
var date = date0.getDate().toString();
var hours = (date0.getHours()+9).toString();
//現在時刻の分
var minutes1 = date0.getMinutes().toString();
//現在時刻から10分前
var minutes2 = (date0.getMinutes()-10).toString();

var date1 = year +month + date + hours + minutes1;
var date2 = year +month + date + hours + minutes2;

context.log("今"+date1);
context.log("10分後"+date2);



    // query to return all items
    
    const querySpec = {
     //  query: "SELECT * from c "
    query: "SELECT * from c WHERE c.time between '" + date2 +"' and '" + date1 +"'"
    };
    
    // read all items in the Items container
    const { resources: items } = await container.items
      .query(querySpec)
      .fetchAll();

    let getitems = "";
    items.forEach(item => {

      console.log(`${item.id} - ${item.message}`);
      getitems =  getitems+item.message;

      



      const client = new line.Client({
        channelAccessToken: token
      });
      

      const message = {
        type: 'text',
        text: item.message+ 'はちゃんとやったの❓\n「はい」か「いいえ」で答えててね❗️',
        "quickReply": {
          "items": [
            {
              "type": "action",
              "action": {
                "type":"postback",
                "data":"yes",
                "label":"はい",
                "displayText":"ちゃんとやったよ！"
              }
            },
            {
              "type": "action",
              "action": {
                "type":"postback",
                "data":"no",
                "label":"いいえ",
                "text":"まだできてないよ・・・・・"
              }
            },
          ]
        }
      }

      const audioMessage = {
        type: 'audio',
        originalContentUrl: item.audio,
        duration: 60000,
        "quickReply": {
            "items": [
              {
                "type": "action",
                "action": {
                  "type":"postback",
                  "data":"yes",
                  "label":"はい",
                  "displayText":"ちゃんとやったよ！"
                }
              },
              {
                "type": "action",
                "action": {
                  "type":"postback",
                  "data":"no",
                  "label":"いいえ",
                  "text":"まだできてないよ・・・・・"
                }
              },
            ]
          }
        }
      
     client.pushMessage(item.userId, message)
        .then(() => {
          console.log('push!')
        })
        .catch((err) => {
          // error handling
      });

      client.pushMessage(item.userId, audioMessage)
      .then(() => {
        console.log('push!')
      })
      .catch((err) => {
        // error handling
    });

      });
    
};