/* Setting things up. */
require('dotenv').config()

var fs = require('fs'),
    path = require('path'),
    express = require('express'),
    chalk = require('chalk'),
    sass = require('node-sass-middleware'),
    mongoose = require('mongoose'),
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
    T = new Twit(config.twitter),
    stream = T.stream('statuses/sample');

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

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
    if (today === 2) {
      return 'monday';
    } else if (today === 6) {
      return 'friday'
    }
  },

  tweet: (message) => {
    T.post('statuses/update', {
      status: '@' + user + ' ' + message
    }, function(err, data, response) {
      if (err){
           // TODO: Proper error handling?
        console.log('Error!');
        console.log(err);
      }
      else{
        // did it work
        console.log(data)
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
            console.log(user)
            console.log(TwitBot.today())
            if (TwitBot.today === 'monday') {
              TwitBot.tweet(monday_message);
            } else if (TwitBot.today === 'friday') {
              TwitBot.tweet(friday_message);
            };
          });
        }
      }
    })
  }

};

TwitBot.init();

// T.get('followers/list', { screen_name: process.env.TWITTER_HANDLE },  function (err, data, response) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log('this is the data', data)
//     if (data.users.length > 0) {
//       var users = data.users.map(user => {
//         return user.screen_name;
//       }),

//       users.forEach(user => {
//         console.log(user)

//         T.post('statuses/update', {
//           status: '@' + user + ' ' + random_from_array(bot_responses),
//           in_reply_to_status_id: status.id_str
//         }, function(err, data, response) {
//           if (err){
//               /* TODO: Proper error handling? */
//             console.log('Error!');
//             console.log(err);
//           }
//           else{
//             //
//           }
//         });
//       });
//     }
//   }
// })

/* You can use uptimerobot.com or a similar site to hit your /tweet endpoint to wake up your app and make your Twitter bot tweet. */

app.use("/tweet", function (request, response) {
  console.log('here')

  /* Respond to @ mentions */
  // fs.readFile(__dirname + '/last_mention_id.txt', 'utf8', function (err, last_mention_id) {
  //   /* First, let's load the ID of the last tweet we responded to. */
  //   console.log('last_mention_id:', last_mention_id);


  //   T.get('search/tweets', { q: 'to:' + process.env.TWITTER_HANDLE + ' -from:' + process.env.TWITTER_HANDLE, since_id: last_mention_id }, function(err, data, response) {
  //     /* Next, let's search for Tweets that mention our bot, starting after the last mention we responded to. */
  //     if (data.statuses.length){
  //       // console.log(data.statuses);
  //       data.statuses.forEach(function(status) {
  //         console.log(status.id_str);
  //         console.log(status.text);
  //         console.log(status.user.screen_name);

  //         /* Now we can respond to each tweet. */
  //         T.post('statuses/update', {
  //           status: '@' + status.user.screen_name + ' ' + random_from_array(bot_responses),
  //           in_reply_to_status_id: status.id_str
  //         }, function(err, data, response) {
  //           if (err){
  //               /* TODO: Proper error handling? */
  //             console.log('Error!');
  //             console.log(err);
  //           }
  //           else{
  //             fs.writeFile(__dirname + '/last_mention_id.txt', status.id_str, function (err) {
  //               /* TODO: Error handling? */
  //             });
  //           }
  //         });
  //       });
  //     } else {
  //        No new mentions since the last time we checked. 
  //       console.log('No new mentions...');
  //     }
  //   });
  // });

  // /* Respond to DMs */

  // fs.readFile(__dirname + '/last_dm_id.txt', 'utf8', function (err, last_dm_id) {
  //   /* Load the ID of the last DM we responded to. */
  //   console.log('last_dm_id:', last_dm_id);

  //   T.get('direct_messages', { since_id: last_dm_id, count: 200 }, function(err, dms, response) {
  //     /* Next, let's search for Tweets that mention our bot, starting after the last mention we responded to. */
  //     if (dms.length){
  //       dms.forEach(function(dm) {
  //         console.log(dm.sender_id);
  //         console.log(dm.id_str);
  //         console.log(dm.text);

  //         /* Now we can respond to each tweet. */
  //         T.post('direct_messages/new', {
  //           user_id: dm.sender_id,
  //           text: random_from_array(bot_responses)
  //         }, function(err, data, response) {
  //           if (err){
  //             /* TODO: Proper error handling? */
  //             console.log('Error!');
  //             console.log(err);
  //           }
  //           else{
  //             fs.writeFile(__dirname + '/last_dm_id.txt', dm.id_str, function (err) {
  //               /* TODO: Error handling? */
  //             });
  //           }
  //         });
  //       });
  //     } else {
  //       /* No new DMs since the last time we checked. */
  //       console.log('No new DMs...');
  //     }
  //   });
  // });

  /* TODO: Handle proper responses based on whether the tweets succeed, using Promises. For now, let's just return a success message no matter what. */
  // response.sendStatus(200);
});

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env')); 
  console.log('  Press CTRL-C to stop\n');
});
