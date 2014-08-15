from pymongo import MongoClient
from random import randint
from random import sample as do_sampling
from cell import cell
import json

REPEAT_FETCH = 10
BATCH_READS = 100
REPEAT_DUPLICATE = 3
BATCH_DUPLICATE = 100

def main():
	#connect mongodb
	client = MongoClient()
	client.data_platform_dev.authenticate('app', 'wenhui')
	db = client.data_platform_dev
	cells_collection = db.cells

	#randomly batch read in samples
	samples = []
	randomly_skip_list = []
	fault_list = []
	success = True

	for i in xrange(0, REPEAT_FETCH):
		randomly_skip_list.append( randint(0, 14000000) )

	for skip in randomly_skip_list:
		print skip
		for sample in cells_collection.find().skip(skip).limit(BATCH_READS):
			samples.append(sample)

	#randomly duplicate some samples
	for i in xrange(0, REPEAT_DUPLICATE):
		for duplicate in do_sampling(samples, BATCH_DUPLICATE):
			samples.append(duplicate)

	#request api service and verify result
	for sample in samples:
		#for each request sample
		oneObjAllHit = False
		othersParamHit = True

		#get request return list
		result_list = json.loads( cell(sample['mnc'], sample['lac'], sample['cell']) )

		#there should be one cell object all hit
		for returned_obj in result_list:
			#one returned object get all hit with request sample
			if allHit(sample, returned_obj):
				oneObjAllHit = True
				break

		#others get param hit
		for returned_obj in result_list:
			if not paramHit(sample, returned_obj):
				othersParamHit = False
				break

		if not (oneObjAllHit and othersParamHit):
			print 'Wrong!!!!'
			fault_list.append(sample)
			success = False

	if success:
		print 'Vola!!'
	else:
		print 'Ahoh'

	#may add malicious request later


def allHit(sample, result):
	for key in result.keys():
		if key not in sample or sample[key] != result[key]:
			return False

	return True


def paramHit(sample, result):
	return sample['mnc'] == result['mnc'] and sample['lac'] == result['lac'] and sample['cell'] == result['cell']

if __name__ == '__main__':
	main()
