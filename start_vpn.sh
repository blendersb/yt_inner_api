openvpn --config /vpnbook/vpnbook-us16-udp53.ovpn --auth-user-pass /vpnbook/credentials.txt 

# Give OpenVPN time to establish a connection
sleep 10
npm start