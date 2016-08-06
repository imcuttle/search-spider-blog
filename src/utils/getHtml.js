/**
 * Created by Moyu on 16/8/5.
 */
var http = require('http')
var request = require('request')
var cheerIO = require('cheerio')

module.exports = function (url, path, toJq) {
    toJq = toJq || false;
    // url = url.replace(/^(http|https):\/\//, "")
    return new Promise(function (resolve, reject) {
        request(url+encodeURI(path), function (err, res, body) {
            if(err) reject(err);
            console.info(`response about ${url+path} Code: ${res.statusCode}`)
            if (!err && res.statusCode == 200) {
                resolve(toJq ? cheerIO.load(body, {
                    // ignoreWhitespace: true,
                    normalizeWhitespace: true
                }) : body);
            }else {
                reject(`response about ${url+path} Code: ${res.statusCode}`);
            }
        })
        /*
        http.get({
            protocol: "http:",
            hostname: url,
            path: encodeURI(path),
            headers: {

            }
        }, function (income) {
            let html = ""
            income.setEncoding(null)
            income.on("data", function (chunk) {
                html += chunk;
            })
            income.on('error', function (err) {
                reject(err);
            })
            income.on("end", function () {
                if(income.statusCode!==200) {
                    reject(`response about ${url+path} Code: ${income.statusCode}`)
                    console.error(`response about ${url+path} Code: ${income.statusCode}\r\n${JSON.stringify(income.headers, null, 4)}`)
                }else{
                    console.info(`response about ${url+path} Code: ${income.statusCode}`)
                    resolve(toJq ? cheerIO.load(html, {
                        // ignoreWhitespace: true,
                        normalizeWhitespace: true
                    }) : html);
                }
            })
        }).on('error', function (err) {
            reject(err);
        })
        */
    })
}

// module.exports("http://www.baidu.com", true).then(console.log, console.error)