const http = require('http')
const fs = require('fs')
const myurl = require('url')
const formidable = require('formidable')
const mysql = require('mysql')
const pyshell = require('python-shell')
const {PythonShell} = require("python-shell");

const hostname = "localhost"
const port = 8080
const img_folder = './img/'

setInterval(function(){
    PythonShell.run('main.py',null, (err, result)=>{
        console.log(result)
    })
}, 5000)

const server = http.createServer((req, res) => {
    const path = myurl.parse(req.url)
    console.log('--->>  ' + req.url)
    let conn = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'sys'
    })
    conn.connect()

    //返回index.html
    if (path.pathname === '/') {
        fs.readFile('./index.html', (err, data) => {
            if (err) {
                console.log(err)
                conn.end()
                res.end()
            } else {
                res.statusCode = 200
                conn.end()
                res.write(data)
                res.end()
            }
        })
    } else if (path.pathname === '/jquery.form.js') {
        res.writeHead(200, {'Content-Type': 'text/html'})
        fs.readFile('./jquery.form.js', (err, data) => {
            if (err) {
                conn.end()
                throw err
            } else {
                conn.end()
                res.end(data)
            }
        })
    } else if (path.pathname === '/config.js') {
        res.writeHead(200, {'Content-Type': 'text/html'})
        fs.readFile('./config.js', (err, data) => {
            if (err) {
                conn.end()
                throw err
            } else {
                conn.end()
                res.end(data)
            }
        })
    } else if (path.pathname === '/apps') {

        conn.query('select distinct bank_name from versions', (error, results) => {
            if (error) {
                conn.end()
                throw error
            }
            conn.end()
            res.writeHead(200, {'Content-Type': 'application/json'})
            res.end(JSON.stringify(results))
        })
    } else if (path.pathname === '/vernum') {
        //var urlQuery = url.parse(req.url, true)
        var name = new URL(hostname + ':' + port + req.url).searchParams.get('name')

        conn.query(`select distinct ver from versions where bank_name='${name}' order by ver desc`, (err, results) => {
            if (err)
                throw err
            res.writeHead(200, {'Content-Type': 'application/json'})

            var json = {}
            conn.query(`select update_time from versions where bank_name='${name}' and ver='${results[0].ver}' order by ver desc`, (err, results1) => {
                json['date'] = results1[0].update_time
                json['results'] = results
                conn.end()
                res.end(JSON.stringify(json))
            })
        })
    } else if (path.pathname === '/verinfo') {
        let paras = new URL(hostname + ':' + port + req.url).searchParams;
        let name = paras.get('name')
        let ver = paras.get('ver')
        conn.query(`select * from versions where bank_name='${name}' and ver='${ver}'`, (err, results) => {
            if (err) {
                conn.end()
                throw err
            }
            conn.end()
            res.writeHead(200, {'Content-Type': 'application/json'})
            res.end(JSON.stringify(results))
        })
    } else if (path.pathname === '/submit') {           //提交表单
        let paras = new URL(hostname + ':' + port + req.url).searchParams
        let name = paras.get('name')
        let ver = paras.get('ver')
        let feature = paras.get('feature')
        let form = new formidable.IncomingForm()
        form.on('file', (filed, file) => {
            let search = `select id from versions where bank_name='${name}' and ver='${ver}' and feature='${feature}'`
            conn.query(search, (err, data) => {
                if (err) {
                    conn.end()
                    throw err
                }
                let id = data[0].id
                let add_img = `insert into imgs values(${id},'${file.path.substr(4)}')`
                conn.query(add_img, (err, r) => {
                    if (err) {
                        conn.end()
                        throw err
                    }
                })
            })
        })
        form.uploadDir = './img'
        form.keepExtensions = true
        form.parse(req, (err, fields, files) => {
            let update_sql = `update versions set func='${fields.func}', chg='${fields.chg}', special='${fields.special}',
                analysis='${fields.analysis}', ctpart='${fields.ctpart}', genre='${fields.genre}', target='${fields.target}', log_time=curdate() 
                where bank_name='${name}' and ver='${ver}' and feature='${feature}'`
            conn.query(update_sql, (err, results) => {
                if (err) {
                    conn.end()
                    throw err
                } else {
                    conn.end()
                    res.writeHead(200, {'Content-Type': 'application/json'})
                    res.end('{"state":"success"}')
                }
            })
        })
    } else if (path.pathname === '/del') {           //删除一条更新特性
        let paras = new URL(hostname + ':' + port + req.url).searchParams
        let name = paras.get('name')
        let ver = paras.get('ver')
        let feature = paras.get('feature')
        let del_sql = `delete from versions where bank_name='${name}' and ver='${ver}' and feature='${feature}'`
        conn.query(del_sql, (err, result) => {
            if (err) {
                conn.end()
                throw err
            } else {
                conn.end()
                res.writeHead(200, {'Content-Type': 'application/json'})
                res.end()
            }
        })
    } else if (path.pathname === '/delete_img.png') {
        res.writeHead(200, {'Content-Type': 'image/png'})
        fs.readFile('./delete_img.png', (err, data) => {
            if (err) {
                conn.end()
                throw err
            } else {
                conn.end()
                res.write(data, "binary")
                res.end()
            }
        })
    } else if (path.pathname === '/arrow.png') {
        res.writeHead(200, {'Content-Type': 'image/png'})
        fs.readFile('./arrow.png', (err, data) => {
            if (err) {
                conn.end()
                throw err
            } else {
                conn.end()
                res.write(data, "binary")
                res.end()
            }
        })
    } else if (path.pathname === '/404.jpeg') {
        res.writeHead(200, {'Content-Type': 'image/jpeg'})
        fs.readFile('./404.jpeg', (err, data) => {
            if (err) {
                conn.end()
                throw err
            } else {
                conn.end()
                res.write(data, "binary")
                res.end()
            }
        })
    } else if (path.pathname === '/favicon.ico') {
        res.writeHead(200, {'Content-Type': 'image/png'})
        fs.readFile('./favicon.ico', (err, data) => {
            if (err) {
                conn.end()
                throw err
            } else {
                conn.end()
                res.write(data, "binary")
                res.end()
            }
        })
    } else if (path.pathname === '/imgs') {
        let paras = new URL(hostname + ':' + port + req.url).searchParams
        let id = paras.get('id')
        conn.query(`select imgpath from imgs where id=${id}`, (err, r) => {
            if (err) {
                conn.end()
                throw err
            }
            conn.end()
            res.writeHead(200, {'Content-Type': 'application/json'})
            res.end(JSON.stringify(r))
        })
    } else if (path.pathname === '/img') {
        let paras = new URL(hostname + ':' + port + req.url).searchParams
        let path = './img/' + paras.get('path')
        if (path.match('(.jpg)$'))
            res.writeHead(200, {'Content-Type': 'image/jpg'})
        else if (path.match('(.jpeg)$'))
            res.writeHead(200, {'Content-Type': 'image/jpeg'})
        else if (path.match('(.png)$'))
            res.writeHead(200, {'Content-Type': 'image/png'})

        fs.readFile(path, (err, data) => {
            if (err) {
                conn.end()
                throw err
            }
            conn.end()
            res.write(data, "binary")
            res.end()
        })
    } else if (path.pathname === '/drop_img') {
        let paras = new URL(hostname + ':' + port + req.url).searchParams
        let name = paras.get("name")
        let path = img_folder + name
        let delete_sql = `delete from imgs where imgpath='${name}'`

        conn.query(delete_sql, (err, result) => {
            if (err) {
                conn.end()
                throw err
            }
            fs.unlinkSync(path)
            conn.end()
            res.writeHead(200, {"Content-Type": "application/json"})
            res.end()
        })

    } else if (path.pathname === '/submit_sum') {
        let paras = new URL(hostname + ':' + port + req.url).searchParams
        let name = paras.get("name")
        let ver = paras.get("ver")
        conn.query(`select DATE_FORMAT(update_time,'%Y-%m-%d') from versions where bank_name='${name}' and ver='${ver}'`, (err, result) => {
            if (err) {
                conn.end()
                throw err
            }
            conn.query(`delete from summary where bank_name='${name}' and ver='${ver}'`, (err, results) => {
                if (err) {
                    conn.end()
                    throw err
                }
                let form = new formidable.IncomingForm()
                form.parse(req, (err, fields, files) => {
                    if (err) {
                        conn.end()
                        throw err
                    }
                    let list = []
                    let index = 0
                    for (let i in fields) {
                        if (fields[i] === '')
                            continue
                        list.push(new Promise((resolve, reject) => {
                            conn.query(`insert into summary values('${name}','${ver}','${result[0]["DATE_FORMAT(update_time,'%Y-%m-%d')"]}','${fields[i]}')`, (err, results) => {
                                if (err)
                                    throw err
                                resolve()
                            })
                        }))
                    }
                    Promise.all(list)
                    conn.end()
                    res.writeHead(200, {"Content-Type": "text/plain"})
                    res.end()
                })
            })
        })
    } else if (path.pathname === '/sum') {
        let paras = new URL(hostname + ':' + port + req.url).searchParams
        let name = paras.get("name")
        let ver = paras.get("ver")
        conn.query(`select item from summary where bank_name='${name}' and ver='${ver}'`, (err, results) => {
            if (err) {
                conn.end()
                throw err
            }
            conn.end()
            res.writeHead(200, {"Content-Type": "application/json"})
            res.end(JSON.stringify(results))
        })
    } else if (path.pathname === '/timeline.html') {
        let paras = new URL(hostname + ':' + port + req.url).searchParams
        let name = paras.get("name")
        conn.query(`select * from summary where bank_name='${name}'`, (err, results) => {
            if (err) {
                conn.end()
                throw err
            } else {
                if (results.length === 0)
                    fs.readFile('./404.html', (err, data) => {
                        if (err) {
                            conn.end()
                            throw err
                        } else {
                            res.statusCode = 200
                            conn.end()
                            res.write(data)
                            res.end()
                        }
                    })
                else
                    fs.readFile('./timeline.html', (err, data) => {
                        if (err) {
                            conn.end()
                            throw err
                        } else {
                            res.statusCode = 200
                            conn.end()
                            res.write(data)
                            res.end()
                        }
                    })
            }
        })

    } else if (path.pathname === '/timeline') {
        let paras = new URL(hostname + ':' + port + req.url).searchParams
        let name = paras.get("name")        //银行名称
        conn.query(`select distinct ver,DATE_FORMAT(update_time,'%Y-%m-%d') from summary where bank_name='${name}' order by ver desc`, (err, results) => {
            let p = []
            for (let i in results) {
                let v = results[i].ver                                      //当前版本
                let t = results[i]["DATE_FORMAT(update_time,'%Y-%m-%d')"]   //更新时间
                p.push(new Promise((resolve, reject) => {
                    conn.query(`select item from summary where bank_name='${name}' and ver='${v}'`, (e, r) => {
                        let obj = {}
                        obj['v'] = v
                        obj['t'] = t
                        obj['r'] = r
                        resolve(obj)
                    })
                }))
            }
            Promise.all(p).then(r => {
                conn.end()
                res.writeHead(200, {'Content-Type': 'application/json'})
                res.end(JSON.stringify(r))
            })
        })
    } else {
        fs.readFile('./404.html', (err, data) => {
            if (err) {
                conn.end()
                throw err
            } else {
                res.statusCode = 200
                conn.end()
                res.write(data)
                res.end()
            }
        })
    }
})

server.listen(port, () => {
    console.log(`服务器运行在 ${hostname}:${port}`)
})