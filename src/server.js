/**
 * Created by Moyu on 16/8/6.
 */
var express = require('express')
var db = require('./db')
var u = require('./utils')
require('./main/load')()

function server(port) {
    port = port || 7890
    let app = express();
    app.listen(port, function () {
        console.log(`[INFO] server running at http://localhost:${port}/`)
    })
    app.get('/', function (req, res) {
        res.end('Hi!')
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

server()