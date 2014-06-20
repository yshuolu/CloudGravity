import sys, urllib2, time, urllib, hmac, hashlib, base64, time

def tupleSort(tuple):
	return tuple[0]

url = 'api.yun.com/cell/near'

access_id = 'f3c563b1407f5784ea1589da350b0c68'

access_key = 'd72afff9735d3467312aaf1d5df06b99'

lng = sys.argv[1]

lat = sys.argv[2]

dis = sys.argv[3]

timestamp = str(int(time.time()))

# print lac

# print cell

# print access_id

# print timestamp

#build param string
#collect all params: lac cell timestamp access_id
paramTupleList = []

paramTupleList.append(('lng', lng))
paramTupleList.append(('lat', lat))
paramTupleList.append(('dis', dis))
paramTupleList.append(('access_id', access_id))
paramTupleList.append(('timestamp', timestamp))

#sort params by key
paramTupleList = sorted(paramTupleList, key=tupleSort)

#print paramTupleList

paramString = ''

for tupleItem in paramTupleList:
	paramString += tupleItem[0] + '=' + tupleItem[1] + '&'

paramString = paramString[:-1]

#string to sign
stringToSign = urllib.quote_plus(url) + '&' + urllib.quote_plus(paramString)

#sign string with HMAC-SHA256
m = hmac.new(access_key, stringToSign, hashlib.sha256)

signature = base64.b64encode( m.digest() )

#compose valid request url
requestURL = 'http://' + url + '?' + paramString +'&' + 'signature=' + urllib.quote_plus(signature)

#time.sleep(6)

print urllib2.urlopen(requestURL).read()