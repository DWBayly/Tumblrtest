// Authenticate via OAuth
var tumblr = require('tumblr.js');
require('dotenv').config();
var client = tumblr.createClient({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  token: process.env.token,
  token_secret: process.env.token_secret
});
// Make the request
client.userInfo(function (err, data) {
  if(err){
    console.log(err)
    return err;
  }
});
client.blogLikes('deepspacebutthole',{limit:20},function(err,data){
  if(err){
    console.log(err);
  }else{
    console.log(data.liked_count);
    for(let x in data.liked_posts){
      console.log(data.liked_posts[x].reblog_key);
      client.reblogPost('dsplikes',{id:data.liked_posts[x].id,state:'queue',reblog_key:data.liked_posts[x].reblog_key},function(res){
        console.log(res);
      });
    }
  }
})