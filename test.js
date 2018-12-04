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
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};
function recursiveStuff(name,offset,likes){
	return new Promise(function(resolve,reject){
		client.blogLikes(name,{limit:200,offset:offset},function(err,data){
			likes=likes.concat(data.liked_posts);
			console.log(data.liked_posts.length);
			if(offset>=data.liked_count || offset>=50){
				resolve(likes);
			}else{
				recursiveStuff(name,offset+data.liked_posts.length,likes).then(function(res){
					resolve(res);
				})
			}
		});
	})

}



function backup(name){
	let re = /\/([^\/]*)$/;
	return new Promise(function(resolve,reject){
		recursiveStuff(process.env.blog,0,[]).then(function(likes){
		let filename="";
	 	for(let x in likes){
	 	    switch(likes[x].type){
				case 'photo':
					mkdirp('./photos/'+likes[x].reblog_key, function(err) {
				    	for(let y in likes[x].photos){
				    		let filename = re.exec(likes[x].photos[y].original_size.url)[1];
				    		download(likes[x].photos[y].original_size.url, "./photos/"+likes[x].reblog_key+"/"+filename, function(){
					  			console.log('done');
							});
				    	}
			    	});
	    		break;
				case 'text':
					mkdirp('./text/'+likes[x].reblog_key, function(err) {
			    		let content = likes[x].body;
			    		let linkre = /<img\ssrc="([^"]*)/g;
			    		let links = "";
						let imagearr=[];
						let index = 0;
						while((links=linkre.exec(content))!=null){
							index++;
			    			//console.log(links);
			    			imagearr.push(links[1]);
				   		}
						//console.log(imagearr);
						for(let z in imagearr){
							filename = re.exec(imagearr[z])[1];
							console.log(filename);
							content=content.replace(imagearr[z],filename);
								download(imagearr[z],'./text/'+likes[x].reblog_key+"/"+filename,function(err){
									if(err){
										console.log(err);
									}
								});
						}
						fs.writeFile('./text/'+likes[x].reblog_key+'/index.html',content,function(err){
							if(err){
								console.log(err);
							}
						})
					});
				break;	
		    	case 'audio':
					mkdirp('./audio/'+likes[x].reblog_key, function(err) {
						filename = re.exec(likes[x].audio_url)[1];
						download(likes[x].audio_url,'./audio/'+likes[x].reblog_key+"/"+filename,function(err){
							if(err){
								console.log(err);
							}
						});
					});
	    		break;	
		    	case 'video':
					mkdirp('./video/'+likes[x].reblog_key, function(err) {
						filename = re.exec(likes[x].video_url)[1];
			    		download(likes[x].video_url,'./video/'+likes[x].reblog_key+"/"+filename,function(err){
							if(err){
			    				console.log(err);
			    			}
			    		});
					});
		    		break;
			    	default:
			    	//console.log(likes[x]);
				}	
			}
		});
		resolve(true);
	}) 
}

// client.blogLikes(process.env.blog,2,function(res,data){
// 	console.log(data.liked_count); 
// })

mkdirp('./photos', function(err) {
	mkdirp('./video',function(err){
		mkdirp('./audio',function(err){
			mkdirp('./text', function(err) {
				if(err){
					console.log(err);
					exit();
				}
				backup(process.env.blog).then(function(res){
					console.log(res);
				})
		    	// path exists unless there was an error
		    	console.log("beep boop")
    		});
		});
	});
});

// download('https://66.media.tumblr.com/4faca7217fb4cba0ccf85386f4c5b725/tumblr_n0gia5bS6Q1sjep8do1_1280.jpg', 'google.png', function(){
//   console.log('done');
// });