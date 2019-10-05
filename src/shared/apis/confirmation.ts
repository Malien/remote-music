import http from "http"
import { readFile, exists } from "fs"
import { parse } from "url"

const options: http.ServerOptions = {}
let server: http.Server | null
let reqCount = 0
export const protocol = "http"
export const port = 9190
export const hostname = "localhost"
export const redirectRoute = "callback"
export const redirectURI = `${protocol}://${hostname}:${port}/${redirectRoute}`

export function servePage() {
    if (!server) {
        server = http.createServer(options, (req, res) => {
            if (req.url) {
                let url = parse(req.url)
                let path = url.pathname
                if (path === `/${redirectRoute}`) {
                    exists("./dist/app/views/callback.html", (exists) => {
                        if (exists) {
                            readFile("./dist/app/views/callback.html", (err, data) => {
                                if (err) {
                                    res.statusCode = 500
                                    res.end(err)
                                } else {
                                    res.setHeader("Content-type", "text/html")
                                    res.end(data)
                                }
                            })
                        }
                        else {
                            res.statusCode = 500
                            res.end("Page not found")
                        }
                    }) 
                } else {
                    res.statusCode = 400
                    res.end("No such route")
                }
            }
        })
        server.listen(port)
    }
    reqCount++
}

export function doneServing() {
    reqCount--
    if (reqCount == 0 && server) {
        server.close((err) => {
            server = null
            if (err) throw err
        })
    }
}

export default { servePage, doneServing }