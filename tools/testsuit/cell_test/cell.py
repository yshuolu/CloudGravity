import sys, urllib2, time, urllib
import sign

url = 'api.yun.com/cell'
#url = 'api.91yzh.cn/cell'

access_id = '0d0ff40097e7ff7a7c745b8342f4ef53'

access_key = '04e71a760718e847ffd81615292b6a3a'

def cell(lac, cell):

	lac = str(lac)
	cell = str(cell)

	timestamp = str(int(time.time()))

	#build param string
	#collect all params: lac cell timestamp access_id
	paramTupleList = []

	paramTupleList.append(('lac', lac))
	paramTupleList.append(('cell', cell))
	paramTupleList.append(('access_id', access_id))
	paramTupleList.append(('timestamp', timestamp))

	#sign
	signature = sign.sign(url, paramTupleList, access_key)

	#paramString
	paramString = ''

	for tupleItem in paramTupleList:
		paramString += tupleItem[0] + '=' + tupleItem[1] + '&'

	#compose valid request url
	requestURL = 'http://' + url + '?' + paramString + 'signature=' + urllib.quote_plus(signature)

	print requestURL

	print urllib2.urlopen(requestURL).read()
