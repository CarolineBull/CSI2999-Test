let express = require('express')
let moment = require('moment')
let pm2 = require('pm2')
let numeral = require('numeral');
let jquery = require('jquery');
let https = require('follow-redirects').https;
let fs = require('fs');
let io
let app = express()
let net = require('net')
let socket = require('socket.io')
let serverNet = net.createServer()
let server
//let Summary = {"url": "https://api.covid19api.com/summary", "method": "GET", "timeout": 0,};
//let live = {"url": "https://api.covid19api.com/live/country/south-africa/status/confirmed/date/2020-03-21T13:13:30Z", "method": "GET", "timeout": 0,};
let summary = {'method': 'GET', 'hostname': 'api.covid19api.com', 'path': '/summary', 'headers': {}, 'maxRedirects': 20};
let max = 0;
let tcArray = [];
let sResponse = []
let cResponse = []




function start() {
    server = app.listen(80, function () {
        console.log('Starting Covid Tracker 2020...')

        app.use(express.static('public')) // to use public folder

        io = socket(server); // same as io = socket.app.listen

        io.on('connection', (socket) => {//start of socket.io

            console.log('Socket Connected!')

            // let req = https.request(options, function (res) {
            //     let chunks = [];
            //
            //     res.on("data", function (chunk) {
            //         chunks.push(chunk);
            //     });
            //
            //     res.on("end", function (chunk) {
            //         let body = Buffer.concat(chunks);
            //         console.log(body.toString());
            //
            //
            //
            //     });
            //
            //     res.on("error", function (error) {
            //         console.error(error);
            //     });
            // });
            //
            // req.end();


            socket.on('java', function (data) {


                let msg = JSON.parse(data);

                switch (msg.type) {
                    case 'construct': // should fire every three seconds...
                        let req = https.request(summary, function (res) {
                            let chunks = [];

                            res.on("data", function (chunk) {
                                chunks.push(chunk);
                            });

                            res.on("end", function (chunk) {
                                let response = Buffer.concat(chunks);
                               // console.log(response.toString());
                                //createTop10(response)
                                createTop10(response)
                                //setInterval(createTop10, 600000, response)


                            });

                            res.on("error", function (error) {
                                console.error(error);
                            });
                        });

                        req.end();



                        // io.emit('html', JSON.stringify({type:'TopTen'}))
                        break;
                    default:
                        break;
                }


            })
        })


    })
}
start()
//goes under event\/


function createTop10(response) {
     sResponse = response.toString();
     cResponse = JSON.parse(sResponse)
        let tcArray = [];//special array
        let num =0;
        cResponse.Countries.forEach(function (index) {//filter through, greatest value
            tcArray.push({num: num++, name: index.Country, totalCases: index.TotalConfirmed})

            //let foundIndex = tcArray.findIndex(element => element === msg.data.name);//this is saying that if an element in the array equals the msg.data object, then update
          //  processArray[foundIndex] = msg.data;

            tcArray.sort(function (a, b) {
                if (a.totalCases !== b.totalCases) {
                    return b.totalCases - a.totalCases
                }
                // if (a.num !== b.num) {
                //     return b.num - a.num
                // }
            })

        })
        //console.log(tcArray)
    console.log(cResponse)
    let count =0;
        while(count < 178){
            tcArray.pop()
            count++
        }
        console.log(tcArray)
        io.emit('html', JSON.stringify({type: 'TopTen', data:tcArray}))



}
