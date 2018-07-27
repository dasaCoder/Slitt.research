

const express = require('express');
const Twitter = require('twitter');
const config  = require('./twitter');
const axios = require('axios');
const bodyParser = require('body-parser');

var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');

    iam_api = {
        "apikey": "qQ0tt15zfk8wxd9jsATmlwqyNrCWDnV6ijAFKvs-kOHP",
        "iam_apikey_description": "Auto generated apikey during resource-key operation for Instance - crn:v1:bluemix:public:natural-language-understanding:us-east:a/b38c71c7f0374f5c83eeae84dcf42b4c:ce6778dc-1ce3-4dc6-8750-9cc645cf2f52::",
        "iam_apikey_name": "auto-generated-apikey-b5f37603-ea5b-4c96-8de1-2c02dd964ed6",
        "iam_role_crn": "crn:v1:bluemix:public:iam::::serviceRole:Manager",
        "iam_serviceid_crn": "crn:v1:bluemix:public:iam-identity::a/b38c71c7f0374f5c83eeae84dcf42b4c::serviceid:ServiceId-6e69dcbf-09fe-472a-aea5-f8e0abb4b11b",
        "url": "https://gateway-wdc.watsonplatform.net/natural-language-understanding/api"
    };

var natural_language_understanding = new NaturalLanguageUnderstandingV1({
  version: '2018-03-16',
  apikey: '_HbRDCoaTzZhfIkWI3KTRxneZfsBqxzA5dxZSttigYks'
})



var app = new express();

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());


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

    
    });
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
                             

                                y = {
                                    'id_str':obj['id_str'],
                                    'created_at': obj['created_at'],
                                    'full_text':obj["full_text"],
                                    'img_url': obj['entities']["media"][0]["media_url"], 
                                    'word_count':obj['display_text_range'][1], 
                                    'font_count': obj['full_text'].split(" ").length,
                                    'retweet_count': obj['retweet_count'],
                                    'favorite_count': obj['favorite_count'],
                                    'hash_tags':hashtags};
                            } 
                        }
                            
                        else{
                                y = {
                                    'id_str':obj['id_str'],
                                    'created_at': obj['created_at'],
                                    'full_text':obj["full_text"], 
                                    'word_count':obj['full_text'].split(" ").length, 
                                    'font_count': obj['display_text_range'][1],
                                    'retweet_count': obj['retweet_count'],
                                    'favorite_count': obj['favorite_count'],
                                    'hash_tags':hashtags
                                }
                            }
                    } 
                    else{
                            y = {'id_str':obj['id_str'], 'full_text':obj["full_text"], 
                            'created_at': obj['created_at'],
                            'word_count':obj['full_text'].split(" ").length, 
                            'font_count': obj['display_text_range'][1],
                            'retweet_count': obj['retweet_count'],
                            'favorite_count': obj['favorite_count'],
                            'hash_tags':hashtags}
                        }

                    z++;
                    return y;

                            

                });
                //res.send(tweets);
                //getRetweets(x,res);
                res.send(x);
               // return x;
            })
            .catch(error=>{
                res.send(error);
            });


});

app.get('/get_replies/:screen_name/:tweet_id',(req,res,next)=>{
    let screen_name = req.params.screen_name;
    let twitter_id = req.params.tweet_id;
    let parameters = {
        'q' : 'to:' + +screen_name, // no need to urlencode this!
          'count': 1000,
          'result_type': 'json',
          'include_entities' :true,
          'since_id' :twitter_id
    };

    let tweetid = twitter_id;

    twitter.get('/search/tweets',parameters,(err,tweets,response)=>{
        //res.send(tweets['statuses']);
        let x = tweets['statuses'].map(obj=>{
            if(obj['in_reply_to_status_id_str'] == tweetid ){
                return obj['text'];
            }
            //return obj;
        });
        res.send(x.filter(function(n){ return n != undefined }));
    })
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

app.post('/get_image_analyse',(req,res,next)=>{
    if(req.body.img_url!=undefined){
        let img_url = req.body.img_url;
    console.log(req.body.img_url);
    axios.post(
        'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBC1PFRCUQl_9I6PIZW-yoJNgJf5utI7ZU',
        {
            "requests": [
              {
                "image": {
                  "source": {
                    "imageUri": img_url
                  }
                },
                "features": [
                  {
                    "type": "IMAGE_PROPERTIES",
                    "maxResults": 1
                  },
                  {
                    "type": "LABEL_DETECTION",
                    "maxResults": 5
                  }
                ]
              }
            ]
          }
        )
        .then(data=>{
            let colourdata = data.data.responses[0].imagePropertiesAnnotation.dominantColors.colors;

            //JSON.parse(datanew);
            //console.log(colourdata);
           // res.send(data.data.responses[0].imagePropertiesAnnotation);
        //   let y= colourdata.map(color=>{
        //        let x = {};
        //        x = {
        //            'color':rgbToHex(color['color']['red'],color['color']['green'],color['color']['blue']),
        //            "score": color["score"],
        //            "pixelFraction": color["pixelFraction"]
        //             };
        //        return x;
               
        //    });

        let dominant_color = colourdata.sort(function (a,b) {
            if (a['score'] < b['score']) return  1;
            if (a['score'] > b['score']) return -1;
            // if (a[2] > b[2]) return  1;
            // if (a[2] < b[2]) return -1;
            return 0;
        });

           let z = data.data.responses[0].labelAnnotations.map(obj=>{
               return obj['description'];
           })

           
           res.send({'labels':z,'dominant_colors':rgbToHex(dominant_color[0]['color']['red'],
                                                            dominant_color[0]['color']['green'],
                                                            dominant_color[0]['color']['blue'])});

            // for(let x = 0;x<colourdata.length;x++){
            //     //console.log(colourdata[x])
            //     colourdata[x]['color'] = rgbToHex(colourdata[x]['color']['red'],colourdata[x]['color']['green'],colourdata[x]['color']['blue']);

                
            // }
            
        });
    }
    

});

app.get('/get_sentiment',(req,res,next)=>{
    var parameters = {
        'text': 'IBM is an American multinational technology company headquartered in Armonk, New York, United States, with operations in over 170 countries.',
        'features': {
          'entities': {
            'emotion': true,
            'sentiment': true,
            'limit': 2
          },
          'keywords': {
            'emotion': true,
            'sentiment': true,
            'limit': 2
          }
        }
      }
      
      natural_language_understanding.analyze(parameters, function(err, response) {
        if (err)
          console.log('error:', err);
        else
          res.send(JSON.stringify(response, null, 2));
      });
})



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


function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}