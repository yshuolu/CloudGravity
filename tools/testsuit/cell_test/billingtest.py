import time
from threading import Timer
import cell

REQUEST_INTERVAL = 1 # 1 second per request
MAX_REQUEST = 1000 

def main():
	for i in xrange(0, 1000):
		request()
		time.sleep(REQUEST_INTERVAL)
		

#send request
def request():
	cell.cell(1, 1)

if __name__ == '__main__':
	main()