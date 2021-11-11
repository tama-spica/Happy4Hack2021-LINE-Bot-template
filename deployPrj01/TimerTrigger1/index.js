module.exports = async function (context, myTimer) {
    var timeStamp = new Date().toISOString();
    
    if (myTimer.isPastDue)
    {
        context.log('JavaScript is running late!');
    }

    context.log('JavaScript timer trigger function ran!', timeStamp); 
    
//     //https://developers.line.biz/ja/reference/messaging-api/#send-push-message
// const line = require('@line/bot-sdk');

// const token = '0SNPpsEPdri95On5F3ZZruJcObqwI+3UGADGZn4IVX96ZdUHcHZq1HCVGEgtaiSzrqhX0SB5GgGXnDRLdE8Rv/oYNzQVtbcFnSbda4xCsd296yzr3TNDrmKAGXZzziFqARfTSf1WlQvQABTwBYHDvwdB04t89/1O/w1cDnyilFU='
// const userId = 'U568a9510055a2c90105cd5eff2868a78'

// const client = new line.Client({
//   channelAccessToken: token
// });

// const message = {
//   type: 'text',
//   text: 'Hello World!'
// };

// client.pushMessage(userId, message)
//   .then(() => {
//     console.log('push!')
//   })
//   .catch((err) => {
//     // error handling
// });
    
};