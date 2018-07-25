

const express = require('express');
const Twitter = require('twitter');
const config  = require('./twitter');

var app = new express();


var twitter = new Twitter(config); // initialize twitter

app.get('/', function (req, res) {
    res.send('hello world')
  });

app.get('/twitter_users/:user_name',(req,res,next)=>{
    let user_name = req.params.user_name;
    
    twitter.get('/users/search.json?q='+user_name+'&name='+user_name+'&count=10',function(error,users,response){
        if(error)
            res.sendStatus(500);
        // let user_list = users;
        // for(let x = 0;x<users.length;x++){
        //     user_list[x] = users[x]['screen_name'];
        // }
        console.log(users);

        let user_list = users.map(obj=>{
                var user = {};
                    user = {
                            'id_str': obj['id_str'],
                            'screen_name':obj['screen_name'],
                            'name':obj['name'],
                            'location':obj['location'],
                            'statuses_count':obj['statuses_count'],
                            'description':obj['description'],
                            'followers_count':obj['followers_count'],
                            'friends_count':obj['friends_count'],
                            'profile_image_url':obj['profile_image_url']
                        };
                        return user;
            });

        res.send(user_list);

    
    })
    // twitter.get('/users/search.json?q='+user_name+'&name='+user_name+'&count=10')
    //     .then(users=>{
    //         //var r = 0;
    //         // let user_list = users.map(obj=>{
    //         //     var user = {};
    //         //         user = {
    //         //                 'screen_name':obj['screen_name'],
    //         //                 // 'description':obj['description'],
    //         //                 // 'followers_count':obj['followers_count'],
    //         //                 // 'friends_count':obj['friends_count'],
    //         //                 // 'profile_image_url':obj['profile_image_url']
    //         //             };
    //         //             return user;
    //         // });

    //         res.send(users);
    //     })
    
});

app.get('/get_tweet/:screen_name',(req,res,next)=>{

    let user_name_final = req.params.screen_name;

    let params = {screen_name: user_name_final, count: 10, tweet_mode: 'extended'}; 

   
        twitter.get('/statuses/user_timeline', params)
            .then(tweets=>{
                
                var z = 0;
                let x = tweets.map(obj=>{
                    var y = {};
                  
                    let hashtags = getHashTags(obj['full_text']);

                    if(obj['entities'] != undefined){
                        if(obj['entities']['media'] != undefined){
                            if(obj['entities']['media'][0] != undefined){
                             

                                y = {'id_str':obj['id_str'],'full_text':obj["full_text"],'img_url': obj['entities']["media"][0]["media_url"], 'word_count':obj['display_text_range'][1], 'hash_tags':hashtags};
                            } 
                        }
                            
                        else{
                                y = {
                                    'id_str':obj['id_str'],
                                    'full_text':obj["full_text"], 
                                    'word_count':obj['display_text_range'][1], 
                                    'hash_tags':hashtags
                                }
                            }
                    } 
                    else{
                            y = {'id_str':obj['id_str'], 'full_text':obj["full_text"], 'word_count':obj['display_text_range'][1], 'hash_tags':hashtags}
                        }

                    z++;
                    return y;

                            

                });
                //console.log(tweets);
                //getRetweets(x,res);
                res.send(x);
               // return x;
            })
            .catch(error=>{
                res.send(error);
            });


});

app.get('/get_retweet/:statusid',(req,res,next)=>{
    let status_id = req.params.statusid;

    twitter.get('/statuses/retweets/'+status_id,(error,retweets,response)=>{
        let retweets_list = retweets.map(obj=>{
            let t = {};
            t = {
                "id_str": obj['id_str'],
                "text": obj['text']
            }
            return t;
        })
        res.send(retweets_list);
    })
        
});



app.listen( process.env.PORT||3000);

/* Extract hashtags text from string as an array */
function getHashTags(inputText) {  
    var regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
    var matches = [];
    var match;

    while ((match = regex.exec(inputText))) {
        matches.push(match[1]);
    }

    return matches;
}

async function getRetweets(tweet,response){
    
    response.send();
    //response.send(tweets);
    // let retweets;
    let retweets1 = await twitter.get('/statuses/retweets/'+id+'?count=5')
        .then(retweet=>{
            retweets = retweet;
        });
    // //console.log(retweets.json());
    // return retweets;
}


