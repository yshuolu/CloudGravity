#cache key format

The cache server may be shared between different services, so the key in memcached is designed in below format to accomplish it:

service base url + space + json string (the real key which matters)

#request signing

raw request

http://api.yun.com?p1=a&p2=b&access_id=userid&timestamp=1221112

add sign

http://api.yun.com?p1=a&p2=b&access_id=userid&timestamp=1221112&sign=ab23d3n5

string to sign

url&p1=a&p2=b&access_id=userid&timestamp=122121   param keys sort by alphabet

use access_key to sign the string

15 mins to decide replay attack

Implement: http header or param auth

Param auth:

percent encode url

append &

percent encode param string

#Cell query

Query cell by LAC and CELL:
api.yun.com/cell?lac=1&cell=2&hex=true

Query cell by LNG LAT and Distance
api.yun.com/cell/near?lng=1&lat=2&dis=10&page=0


#Error code

100	not found
101	internal error
102	invalid parameter
103	no result
104	invalid timestamp
105	invalid signature
106	app not found	
107	


