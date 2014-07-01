import sys, urllib2, time, urllib, hmac, hashlib, base64

def tupleSort(tuple):
	return tuple[0]

#sign with url, params and access_key which is used to sign the request
def sign(url, paramTupleList, access_key):
	#sort params by key
	paramTupleList = sorted(paramTupleList, key=tupleSort)

	paramString = ''

	for tupleItem in paramTupleList:
		paramString += tupleItem[0] + '=' + tupleItem[1] + '&'

	#drop last &
	paramString = paramString[:-1]

	#string to sign
	stringToSign = urllib.quote_plus(url) + '&' + urllib.quote_plus(paramString)

	#sign string with HMAC-SHA256
	m = hmac.new(access_key, stringToSign, hashlib.sha256)

	signature = base64.b64encode( m.digest() )

	return signature
