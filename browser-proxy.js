#!/usr/bin/env node

/**
 * WebSocket proxy server for browser-based mDNS scanning
 * This server bridges the gap between browser clients (via WebSocket)
 * and the mDNS network (via UDP multicast)
 */

const WebSocket = require('ws')
const mdns = require('./')
const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = process.env.PORT || 8080
const WS_PORT = process.env.WS_PORT || 8081

// Create HTTP server to serve the browser client
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    fs.readFile(path.join(__dirname, 'browser-scanner.html'), (err, data) => {
      if (err) {
        res.writeHead(500)
        res.end('Error loading browser-scanner.html')
        return
      }
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(data)
    })
  } else {
    res.writeHead(404)
    res.end('Not found')
  }
})

server.listen(PORT, () => {
  console.log(`HTTP Server listening on http://localhost:${PORT}`)
  console.log(`Open http://localhost:${PORT} in your browser to start scanning`)
})

// Create WebSocket server for mDNS communication
const wss = new WebSocket.Server({ port: WS_PORT })

console.log(`WebSocket Server listening on ws://localhost:${WS_PORT}`)

wss.on('connection', (ws) => {
  console.log('Browser client connected')

  // Create mDNS instance for this connection
  const mdnsInstance = mdns()

  mdnsInstance.on('response', (response, rinfo) => {
    // Send response to browser client
    ws.send(JSON.stringify({
      type: 'response',
      data: response,
      rinfo: rinfo
    }))
  })

  mdnsInstance.on('query', (query, rinfo) => {
    // Optionally send queries to browser client
    ws.send(JSON.stringify({
      type: 'query',
      data: query,
      rinfo: rinfo
    }))
  })

  mdnsInstance.on('warning', (err) => {
    ws.send(JSON.stringify({
      type: 'warning',
      message: err.message
    }))
  })

  mdnsInstance.on('error', (err) => {
    ws.send(JSON.stringify({
      type: 'error',
      message: err.message
    }))
  })

  // Handle messages from browser client
  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message)

      if (msg.type === 'query') {
        // Send mDNS query
        mdnsInstance.query(msg.data)
        console.log('Querying:', msg.data)
      } else if (msg.type === 'scan') {
        // Perform a full scan for common service types
        console.log('Starting mDNS scan...')
        const serviceTypes = [
          '_services._dns-sd._udp.local',
          '_http._tcp.local',
          '_https._tcp.local',
          '_ssh._tcp.local',
          '_sftp-ssh._tcp.local',
          '_airplay._tcp.local',
          '_raop._tcp.local',
          '_googlecast._tcp.local',
          '_printer._tcp.local',
          '_ipp._tcp.local',
          '_smb._tcp.local',
          '_afpovertcp._tcp.local',
          '_nfs._tcp.local',
          '_ftp._tcp.local',
          '_homekit._tcp.local',
          '_hap._tcp.local',
          '_workstation._tcp.local',
          '_device-info._tcp.local'
        ]

        serviceTypes.forEach(serviceType => {
          mdnsInstance.query({
            questions: [{
              name: serviceType,
              type: 'PTR'
            }]
          })
        })

        // Also query for all services
        mdnsInstance.query({
          questions: [{
            name: '_services._dns-sd._udp.local',
            type: 'PTR'
          }]
        })
      }
    } catch (err) {
      console.error('Error processing message:', err)
      ws.send(JSON.stringify({
        type: 'error',
        message: err.message
      }))
    }
  })

  ws.on('close', () => {
    console.log('Browser client disconnected')
    mdnsInstance.destroy()
  })

  // Send initial connection confirmation
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to mDNS proxy server'
  }))
})
