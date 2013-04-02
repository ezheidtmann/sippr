var dgram = require('dgram');
var util = require('util');

const KBSP_HEADER_LEN = 123;
const KBSP_PAYLOAD_MAXLEN = 33;
const KBSP_FOOTER_LEN = 323;
const KBSP_PREFIX = "KBSP v1:";

var s = dgram.createSocket('udp4', function(msg, rinfo) {
  console.log(util.inspect(rinfo));
  console.log(util.inspect(msg));
  // rinfo.size == # bytes
  // rinfo.port == source port
  // rinfo.family == 'IPv4'
  // rinfo.address == source ip as string
  if (rinfo.size > 0 && rinfo.size < KBSP_HEADER_LEN + KBSP_PAYLOAD_MAXLEN + KBSP_FOOTER_LEN) {
    if (msg.toString('ascii', 0, 8) != KBSP_PREFIX) {
      return false;
    }
    
    // type value (2 bytes)
    var type = msg.readUInt16LE(8);
    // length (2 bytes)
    var packet_size = msg.readUInt16LE(10);

    if (packet_size < 0 || packet_size > 112) {
      return false;
    }

    var payload = new Buffer;
    msg.copy(payload, 0, 12, packet_size);

    var received_crc = msg.readUint16LE(12 + packet_size);
    if (gencrc(msg) == received_crc) {
      packets.push({
        type: type
       ,len:  packet_size
       ,payload: payload
       ,crc:  received_crc
      });
    }
  }
}).bind(1234);

