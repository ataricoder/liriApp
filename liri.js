var fs = require('fs');
var os = require('os');
var request = require('request');
var Twitter = require('twitter');
var Spotify = require('spotify-web-api-node');
var prettyjson = require('prettyjson');
var keys = require('./keys.js');

var first_argv = process.argv[2];
var second_argv = process.argv[3];

@param {String} cmd LIRI command user wants to execute.
@param {String} param If needed, argument value provided by user (ie, song or movie).
@return {}
function liriCommandRunner(cmd, param) {
    switch (cmd) {
        case "my-tweets":

            myTweets();
            break;
        case "spotify-this-song":
            spotifyThis(param)
            break;
        case "movie-this":
            movieThis(param)
            break;
        case "do-what-it-says":
            doWhatItSays();
            break;
        default:
            console.log(first_argv + " : command not found");
    }
}

@param {}
@return {}
function myTweets() {

    var twitter_client = new Twitter({
        consumer_key: keys.twitter_keys.consumer_key,
        consumer_secret: keys.twitter_keys.consumer_secret,
        access_token_key: keys.twitter_keys.access_token_key,
        access_token_secret: keys.twitter_keys.access_token_secret
    });

    var user = 'danysexymexy';
    var tweet_count = 20;

    twitter_client.get('statuses/user_timeline', {screen_name: user, count: tweet_count}, function(error, tweets) {

        if (error)
            throw error;
        else {
            var tweet_data = [];

            for ( i in tweets ) {
                var data = {
                        "Created"   : tweets[i].created_at,
                        "Tweet"     : tweets[i].text,
                        "Retweeted" : tweets[i].retweet_count,
                        "Favorited" : tweets[i].favorite_count
                        };
                tweet_data.push(data);
            }

            console.log("---------------------------- START --------------------------------");
            console.log("Successfully retrieved " + tweets.length + " tweets (maximum 20) from Twitter.");
            console.log("===================================================================");
            console.log(prettyjson.render(tweet_data, { keysColor  : 'green', stringColor: 'white' }));
            console.log("===================================================================");
            console.log("---------------------------- END ----------------------------------");
        }
    });

    appendLogFile("Executed my-tweets");
}

@param {String} song Title of song to query using Spotify API.
@return {}
function spotifyThis(song) {

    var spotify_client = new Spotify({
        clientId    : "8fbf13ff66774e47bb1e5fd1bf468846",
        clientSecret: "4cb4f3f532214b708b9e6b168f26f343"
    });

    spotify_client.searchTracks(song).then(function(res) {

        var spot_data = [];
        var tracks = res.body.tracks.items;

        for ( i in tracks ) {
            var data = {
                    "Track"      : tracks[i].name,
                    "Album"      : tracks[i].album.name,
                    "Artist(s)"  : tracks[i].artists[0].name,
                    "Preview URL": tracks[i].preview_url
                    };
            spot_data.push(data);
        }


        var total_items = tracks.length;

        console.log("---------------------------- START --------------------------------");
        console.log("Successfully retrieved " + total_items + " items from Spotify");
        console.log("===================================================================");
        console.log(prettyjson.render(spot_data, { keysColor  : 'green', stringColor: 'white' }));
        console.log("===================================================================");
        console.log("---------------------------- END ----------------------------------");

    }, function(error) {
            console.error(error);
    });

    appendLogFile("Executed spotify-this-song with argument " + "'" + song  + "'");
}


@param {String} movie Title of movie to query using OMDB API.
@return {}
function movieThis(movie) {

    var query_url = 'http://www.omdbapi.com/?t=' + movie +'&y=&plot=long&tomatoes=true&r=json';

    request(query_url, function(error, res, body) {

        if (!error && res.statusCode == 200) {

            var movie_data = {
                "Title"                 : JSON.parse(body).Title,
                "Released"              : JSON.parse(body).Released,
                "Country"               : JSON.parse(body).Country,
                "Language(s)"           : JSON.parse(body).Language,
                "Actors"                : JSON.parse(body).Actors,
                "IMDB Rating"           : JSON.parse(body).imdbRating,
                "Rotten Tomatoes Rating": JSON.parse(body).tomatoRating,
                "Rotten Tomatoes URL"   : JSON.parse(body).tomatoURL,
                "Plot"                  : JSON.parse(body).Plot
            }

            console.log("---------------------------- START --------------------------------");
            console.log("Successfully retrieved OMDB results for " + movie_data.Title + ".");
            console.log("===================================================================");
            console.log(prettyjson.render(movie_data, { keysColor  : 'green', stringColor: 'white' }));
            console.log("===================================================================");
            console.log("---------------------------- END ----------------------------------");
        }
        else
            console.error(error);
    });

    appendLogFile("Executed movie-this with argument " + "'" + movie  + "'");
}


@param {}
@return {}

function doWhatItSays() {

    fs.readFile("random.txt", "utf8", function(err, random_txt) {

        var ran_txt = random_txt.split(',');
        var func = ran_txt[0];
        var param = ran_txt[1];

        console.log("PARAM: ", param);

        switch (func) {
            case "my-tweets":
                myTweets();
                break;
            case "spotify-this-song":
                spotifyThis(param);
                break;
            case "movie-this":
                movieThis(param);
                break;
        }
    });

    appendLogFile("Executed do-what-it-says");
}


@param {}
@return {}

function appendLogFile(log_entry) {

    var dtg = new Date() + ': ';

    fs.appendFile('log.txt', dtg + log_entry + os.EOL, 'utf8', function(error) {
        if (error)
            throw error;
    });
}

liriCommandRunner(first_argv, second_argv);
