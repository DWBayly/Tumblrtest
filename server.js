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
client.blogLikes('deepspacebutthole',{limit:200},function(err,data){
  if(err){
    console.log(err);
  }else{
    console.log(data.liked_count);
    for(let x in data.liked_posts){
      console.log(data.liked_posts[x].reblog_key);
      /**/
    }
  }
});

let likes = [];
function amassList(offset){
  return new Promise((resolve,reject)=>{

    if(offset>2000){
      //console.log(likes);
        resolve(true);

    }
    //console.log((offset/50) + "Passes");
    client.blogLikes('deepspacebutthole',{limit:50,offset:offset},function(err,data){
    console.log((offset/50) + "Passes");
      if(err){
        reject(err);
      }
      for(let x in data.liked_posts){
        likes.push(data.liked_posts[x]);
      }
      amassList(offset+50).then(function(result){
        resolve(result);
      });
    })
  });

}
amassList(50).then(function(result){
  for(let x in likes){
      client.reblogPost('dsblikes',{id:likes[x].id,state:'queue',reblog_key:likes[x].reblog_key},function(res){
          console.log(res);
      });
  }
});