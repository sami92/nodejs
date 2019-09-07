var express = require('express')
var app = express()

var morgan = require('morgan');
var bodyParser  = require('body-parser');
var jwt = require('jsonwebtoken');

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));
app.use(morgan('dev'));

var count = 0;

app.use(function(req, res, next){
	console.log('we have request count ' + count)
	count++
	next();
})

var users = [
	{
      "id": 1,
      "username": "alaa",
      "password": "alaa"
    },
    {
      "id": 2,
      "username": "yaser",
      "password": "yaser"
    },
    {
      "id": 3,
      "username": "noor",
      "password": "noor"
    },
    {
      "id": 4,
      "username": "tahseen",
      "password": "tahseen"
    },
    {
      "id": 5,
      "username": "khalid",
      "password": "khalid"
    },
    {
      "id": 6,
      "username": "ahmad",
      "password": "ahmad"
    }
]

var tweets = [
	{
      "id": 1,
      "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque interdum rutrum sodales. Nullam mattis fermentum libero, non volutpat.",
      "userId": 1,
      "likes": 0
    },
    {
      "id": 2,
      "text": "Lorem ipsum dolor sit amet, tamquam perfecto ad vel, qui te laoreet atomorum ut.",
      "userId": 3,
      "likes": 0
    },
    {
      "id": 3,
      "text": "Lorem ipsum dolor sit amet, cu est choro pertinax molestiae, ponderum volutpat petentium et mel, et mel solet dictas usu.",
      "userId": 5,
      "likes": 0
    },
    {
      "id": 4,
      "text": "Lorem ipsum dolor sit amet, primis accusamus eam ne, sea equidem quaestio quaerendum cu. Cu vis omnis mollis admodum vix.",
      "userId": 6,
      "likes": 0
    },
    {
      "id": 5,
      "text": "Lorem ipsum dolor sit amet, percipit invenire pri ut, an pri paulo oportere. Vitae nonumes pertinax ea cum, ut molestie.",
      "userId": 4,
      "likes": 0
    },
    {
      "id": 6,
      "text": "Lorem ipsum dolor sit amet, percipit invenire pri ut, an pri paulo oportere. Vitae nonumes pertinax ea cum, ut molestie.",
      "userId": 4,
      "likes": 0
    }
];
var tweets_userLikes =[
];
app.get('/', function (req, res) {
  res.send({ message: 'hello '})
})

app.get('/tweets', function(req, res){
	res.send(tweets)
})
app.get('/users', function(req, res){
	res.send(users)
})
app.get('/tweets_userLikes', function(req, res){
	res.send(tweets_userLikes)
})
app.get('/tweets/:id', function(req, res){
		var tweet = tweets.find(function(tweet){return tweet.id ==req.params.id})
		res.send(tweet)
})



app.get('/users/:id', function(req, res){
		var user = users.find(function(user){return user.id ==req.params.id})
		res.send(user)
})
 
 app.post('/signup',function(req,res){
	 console.log(req.body.username)
	 var username= req.body.username
	 var password= req.body.password
	 var i=1
	 while(users[i]!=null)
		 i++
	 i++
	 var user=users.find(function(user){ return (user.username == req.body.username )})
	 if(!user)
	 {
		users.push({ id: i, username: username , password :password})
		res.redirect('/login.html')
	 }
		else 
			res.redirect('/signup.html')
		console.log(users)
 })
 
function authMiddleware(req, res, next){
	//console.log( "token "+req.query.token)
	var token = req.query.token || req.headers['apptoken']

	if (!token){
		return res.status(403).send({
			success: false
		});
	}

	 jwt.verify(token, 'mytopsecret', function(err, decoded){
	 	if (err){
	 		return res.status(403).send({
				success: false
			});
	 	} else {
			app.locals.username=(decoded.username)
			app.locals.id=(decoded.id)
			next()

	 	}
	 })
}


app.put('/tweets/:id',authMiddleware, function(req, res){
		var id = req.params.id
		var userId = app.locals.id
		var check= true
		var i=0
		console.log(app.locals.id)
		console.log(app.locals.username)
		while(tweets_userLikes[i] !=null)
		{
		if (tweets_userLikes[i].tweetsId == id && tweets_userLikes[i].userId == userId){
				check =false
				break;	
			}
			i++
		}
		if(check){
			tweets_userLikes.push({ tweetsId: id, userId : userId})
			var tweet = tweets.find(function(tweet){return (tweet.id == req.params.id)})
			tweet.likes=tweet.likes+1
			//console.log(tweets)
			res.send({ success :true,
			tweet :tweet})
		}else
		res.send({success:false})
	//	console.log(tweets_userLikes)
})

app.post('/authenticate/:username/:password', function(req, res){

	console.log(req.params.username)

	var user = users.find(function(user){ return (user.username == req.params.username )})

	if (!user){
		res.send({ success: false })
	} else {

		if (user.password != req.params.password){
			res.send({ success: false })
		} else {
			var token = jwt.sign(user, 'mytopsecret')
			res.send({
				success: true,
				token: token
			})
		}
	}
})
app.post('/addtweet/:text',authMiddleware, function(req, res){
	console.log(req.params.text)
	var text = req.params.text
	var userId = app.locals.id
	var i=0
	while(tweets[i]!=null)
		 i++
	i++
	tweets.push({ id: i, text: text , userId  :userId ,likes:0})
	//console.log(tweets)
	res.send({ id: i, text: text , userId  :userId ,likes:0})
})


app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})