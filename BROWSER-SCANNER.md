# Browser-based mDNS Network Scanner

A web-based mDNS (Multicast DNS) network scanner that runs entirely in your browser. This tool allows you to discover devices and services on your local network using a simple and intuitive web interface.

## Features

- 🔍 **Real-time Discovery**: Discover mDNS services as they appear on your network
- 🌐 **Browser-based**: No installation required - runs entirely in your web browser
- 📊 **Visual Dashboard**: Clean and modern interface showing discovered services
- 📡 **Multiple Service Types**: Automatically scans for common service types including:
  - HTTP/HTTPS services
  - SSH/SFTP
  - AirPlay/RAOP
  - Google Cast
  - Printers
  - SMB/AFP file sharing
  - HomeKit devices
  - And many more...
- 📝 **Real-time Logs**: See network activity as it happens
- 📈 **Statistics**: Track discovered devices, services, and packets

## How It Works

Since browsers don't have direct access to UDP multicast networking (which mDNS requires), this implementation uses a WebSocket proxy server that:

1. Listens for mDNS packets on your local network
2. Forwards relevant information to the browser via WebSocket
3. Allows the browser to send mDNS queries through the proxy

```
Browser (WebSocket) <---> Proxy Server <---> mDNS Network (UDP Multicast)
```

## Installation

1. Install the WebSocket dependency:

```bash
npm install
```

## Usage

1. Start the browser scanner proxy server:

```bash
npm run browser-scanner
```

Or directly:

```bash
node browser-proxy.js
```

2. Open your web browser and navigate to:

```
http://localhost:8080
```

3. Click the "Start Scan" button to begin discovering devices on your network

## Configuration

The proxy server can be configured using environment variables:

- `PORT`: HTTP server port (default: 8080)
- `WS_PORT`: WebSocket server port (default: 8081)

Example:

```bash
PORT=3000 WS_PORT=3001 npm run browser-scanner
```

If you use a custom WebSocket port, you can specify it in the browser URL:

```
http://localhost:3000?wsPort=3001
```

## Architecture

### Components

1. **browser-proxy.js**: Node.js WebSocket proxy server
   - Creates HTTP server to serve the HTML interface
   - Creates WebSocket server for real-time communication
   - Bridges browser clients to the mDNS network

2. **browser-scanner.html**: Browser-based user interface
   - Connects to the proxy via WebSocket
   - Displays discovered services in real-time
   - Provides controls for scanning and clearing results

## Comparison with mdns-scanner

This implementation provides similar functionality to [mdns-scanner](https://github.com/bnielsen1965/mdns-scanner) but with key differences:

| Feature | mdns-scanner | browser-based scanner |
|---------|--------------|----------------------|
| Environment | Node.js only | Browser + Node.js proxy |
| Interface | CLI/API | Web UI |
| Real-time updates | Event-based | WebSocket streaming |
| User interaction | Code/Terminal | Visual dashboard |

## Limitations

- Requires a proxy server to bridge browser and network (browsers cannot directly access UDP multicast)
- The proxy server must be run on the same network you want to scan
- Some service types may require additional time to respond

## Security Considerations

- The proxy server should only be run on trusted networks
- By default, the server only listens on localhost
- To allow remote connections, bind to a specific interface and use firewall rules

## Troubleshooting

### Services not appearing

1. Ensure the proxy server is running
2. Check that your firewall allows mDNS traffic (UDP port 5353)
3. Verify you're on the same network as the devices you're trying to discover
4. Some devices may take time to respond - wait at least 10 seconds after scanning

### WebSocket connection failed

1. Ensure the proxy server is running
2. Check that the WebSocket port (8081) is not blocked
3. Verify the browser is connecting to the correct hostname

### Browser console errors

Check the browser developer console (F12) for detailed error messages

## License

MIT

## Related Projects

- [multicast-dns](https://github.com/mafintosh/multicast-dns) - The core mDNS library used by this project
- [mdns-scanner](https://github.com/bnielsen1965/mdns-scanner) - Node.js-based mDNS scanner
