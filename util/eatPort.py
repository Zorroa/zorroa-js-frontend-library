import socket
from optparse import OptionParser

# http://stackoverflow.com/questions/7749341/very-basic-python-client-socket-example

parser = OptionParser()

parser.add_option("-p", "--port", dest="port",
                  help="port number", metavar="N", default=4444)

(options, args) = parser.parse_args()
port = int(options.port)

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
host = '0.0.0.0' # socket.gethostname()
port = int(options.port)

print("Listening on host " + host)
print("Listening on port ", port)

s.bind((host,port))
s.listen(5)


while True:
  c, addr = s.accept()
  print("Connection accepted from " + repr(addr[1]))

  # c.send("Into the abyss...\n")
  c.send("<HTML>\n")
  print repr(addr[1]) + ": " + c.recv(1026)
  # c.close() # HA! don't close, leave the connection open & hanging
