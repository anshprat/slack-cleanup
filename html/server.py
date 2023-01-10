# from http.server import HTTPServer, BaseHTTPRequestHandler
import http.server , ssl

# httpd = HTTPServer(('localhost', 443), BaseHTTPRequestHandler)

# httpd = socketserver.TCPServer(('localhost', 443), SimpleHTTPRequestHandler)



import http.server, ssl

server_address = ('localhost', 443)
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket (httpd.socket, 
        keyfile="/Users/anshup/code/anshprat/certs/localhost.key", 
        certfile='/Users/anshup/code/anshprat/certs/localhost.crt', server_side=True)

httpd.serve_forever()
