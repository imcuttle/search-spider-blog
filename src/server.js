/**
 * Created by Moyu on 16/8/6.
 */
var express = require('express')
var db = require('./db')
var u = require('./utils')
var load = require('./main/load')

let info = console.info
let log = console.log
let error = console.error
const tmp = require('fs').createWriteStream(__dirname+'/../temp.log')

console.log = (msg)=>{log(msg); tmp.write(`${new Date()} => #LOG# ${msg}\r\n`)}
console.error = (msg)=>{error(msg); tmp.write(`${new Date()} => #ERROR# ${msg}\r\n`)}
console.info = (msg)=>{info(msg); tmp.write(`${new Date()} => #INFO# ${msg}\r\n`)}

load()

var argv = require('minimist')(process.argv.slice(2));
server(argv.p)
function server(port) {
    port = port || 7890
    let app = express();
    app.listen(port, function () {
        console.log(`[INFO] server running at http://localhost:${port}/`)
    })
    app.get('/', function (req, res) {
        res.end('Hi!')
    })
    app.all('/load', function (req, res) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.write(`config: \r\n${JSON.stringify(global.config, null, 4)}`)
        load().then(function () {
            res.end('\r\nloaded!!!');
        })
    })
    app.get('/api/search/(:type)', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*")
        console.log(`[INFO] request ${req.url} coming`)
        let str = req.query.q;
        let num = parseInt(req.query.n);
        switch (req.params.type) {
            case 'date':
                res.end(JSON.stringify(db.searchByDate(str, num)))
                break
            case 'title':
                res.end(JSON.stringify(db.searchByTitle(str, num)))
                break
            case 'content':
                res.end(JSON.stringify(db.searchByContent(str, num)))
                break
            case 'all':
                if(!!str)
                    res.end(JSON.stringify({
                        date: db.searchByDate(str),
                        title: db.searchByTitle(str),
                        content: db.searchByContent(str)
                    }))
                else
                    res.end(JSON.stringify(
                        db.getAll()
                    ))
                break
            default:
                res.status(404).end()
        }
    })
}

