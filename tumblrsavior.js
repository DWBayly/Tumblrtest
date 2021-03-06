const uuidv4 = require('uuid/v4');
var fs = require('fs');
var tumblr = require('tumblr.js');
require('dotenv').config();
let request = require('request');
var mkdirp = require('mkdirp');
let client = tumblr.createClient({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  token: process.env.token,
  token_secret: process.env.token_secret
});
var mkdirp = require('mkdirp');
function download(uri, filename, callback){
  request.head(uri, function(err, res, body){
  	try{
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  	}catch(err){
  		console.log(err);
  	}
  });
};
function recursiveLikes(offset,likes){
	return new Promise(function(resolve,reject){
		client.blogLikes(process.env.blog,{limit:200,offset:offset},function(err,data){
			//return resolve(data.liked_posts);
			likes=likes.concat(data.liked_posts);
			console.log(data.liked_posts.length);
			if(offset>=data.liked_count){
				return resolve(likes);
			}else{
				recursiveLikes(offset+data.liked_posts.length,likes).then(function(res){
					resolve(res);
				})
			}
		});
	})

}
function recursivePosts(offset,posts){
	return new Promise(function(resolve,reject){
		client.blogPosts(process.env.blog,{limit:200,offset:offset},function(err,data){

			//resolve(data.posts);
			posts=posts.concat(data.posts);
			if(offset>=data.total_posts ){
				return resolve(posts);
			}else{
				recursivePosts(offset+data.posts.length,posts).then(function(res){
					resolve(res);
				})
			}
		});
	})

}


function backup(){
	return new Promise(function(resolve,reject){
		recursivePosts(0,[]).then(function(posts){
			console.log("Made it",posts.length);
			recursiveLikes(0,posts).then(function(likes){
				let x =0; 
				//console.log(likes[642]);
				let interval = setInterval(function(){
					if(x>=likes.length-1||likes[x]==undefined){
						console.log('All Done!');
						clearInterval(interval);
					}else{
						x++;
						console.log("handling post number"+x);
						try{

							handlePost(likes[x]);
						}catch(err){
							console.log(err);
						}
					}
				},500);
				
				return resolve(true);
			});
		});
	}) 
}
function handlePost(like){
	let re = /\/([^\/]*)$/;
	let path = "";
	//return new Promise(function(resolve,reject){
		switch(like.type){
			case 'photo':
				mkdirp('./photos/'+like.reblog_key, function(err) {
					for(let y in like.photos){
						let filename = re.exec(like.photos[y].original_size.url)[1];
			    		download(like.photos[y].original_size.url, "./photos/"+like.reblog_key+"/"+filename, function(){
							console.log('done');

						});
					}
				});
			break;
			case 'text':
				path = './text/'+like.reblog_key;
				mkdirp('./text/'+like.reblog_key, function(err) {
				let content = like.body;
				let linkre = /<img\ssrc="([^"]*)/g;
				let links = "";
				let imagearr=[];
				while((links=linkre.exec(content))!=null){
					imagearr.push(links[1]);
				}
				for(let z in imagearr){
					filename = re.exec(imagearr[z]);
						if(filename!=null){
							filename=filename[1];
							content=content.replace(imagearr[z],filename);
							download(imagearr[z],'./text/'+like.reblog_key+"/"+filename,function(err){
							if(err){
								console.log(err);
								}
							});
							}else{
											console("Null detected");
										}
									}
									fs.writeFile('./text/'+like.reblog_key+'/index.html',content,function(err){
										if(err){
											console.log(err);
										}
									})
					});
			break;	
			case 'audio':
				if(like.audio_type=='soundcloud'){
					return;
				}
								mkdirp('./audio/'+like.reblog_key, function(err) {
									filename = re.exec(like.audio_url);
									if(filename!=null){
										filename=filename[1];
										download(like.audio_url,'./audio/'+like.reblog_key+"/"+filename,function(err){
											if(err){
												console.log(err);
											}
										});
									}else{
										console("Null detected");
									}
								});
			break;	
			case 'video':
								mkdirp('./video/'+like.reblog_key, function(err) {
									filename = re.exec(like.video_url);
									if(filename!=null){
										filename=filename[1];
						    			download(like.video_url,'./video/'+like.reblog_key+"/"+filename,function(err){
											if(err){
						    					console.log(err);
						    				}
						    			});
						    		}else{
						    			console.log("Null detected");
						    		}
								});
			break;
			default:
			console.log(like.type);
		}	
		return true;
	//})
}



mkdirp('./photos', function(err) {
	mkdirp('./video',function(err){
		mkdirp('./audio',function(err){
			mkdirp('./text', function(err) {
				if(err){
					console.log(err);
					exit();
				}
				backup().then(function(res){
					console.log(res);
				})
		    	// path exists unless there was an error
		    	console.log("beep boop")
    		});
		});
	});
});
