/* Setting things up. */
require('dotenv').config()

var fs = require('fs'),
    path = require('path'),
    express = require('express'),
    chalk = require('chalk'),
    sass = require('node-sass-middleware'),
    app = express(),
    Twit = require('twit'),
    config = {
    /* Be sure to update the .env file with your API keys. See how to get them: https://botwiki.org/tutorials/make-an-image-posting-twitter-bot/#creating-a-twitter-app*/
      twitter: {
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
        access_token: process.env.ACCESS_TOKEN,
        access_token_secret: process.env.ACCESS_TOKEN_SECRET
      }
    },
    T = new Twit(config.twitter);

app.set('port', process.env.PORT || 3000);
app.use(express.static('public'));
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));

var TwitBot = TwitBot || {

  monday_message: "Hello! List ONE thing you want to accomplish by the end of the week. I'll check back on friday 🌸",
  friday_message: "Yo! How did you do on your thing?",
  today: () => {
    var today = new Date().getDay()
    if (today === 1) {
      return 'monday';
    } else if (today === 6) {
      return 'friday'
    }
  },

  tweet: (message, user) => {
    T.post('statuses/update', {
      status: '@' + user + ' ' + message
    }, function(err, data, response) {
      if (err){
        console.log(err);
      }
      else{
        console.log(`It worked! Here's the data: ${response}`)
      }
    });
  },

  init: function() {
    T.get('followers/list', { screen_name: process.env.TWITTER_HANDLE },  function (err, data, response) {
      if (err) {
        console.log(err);
      } else {
        if (data.users.length) {
          var users = data.users.map(user => {
            return user.screen_name;
          });

          users.forEach(user => {
            var day = TwitBot.today()
            if (day === 'monday') {
              TwitBot.tweet(TwitBot.monday_message, user);
            } else if (day === 'friday') {
              TwitBot.tweet(TwitBot.friday_message, user);
            };
          });
        }
      }
    })
  }

};

TwitBot.init();

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env')); 
  console.log('  Press CTRL-C to stop\n');
});
