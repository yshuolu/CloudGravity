#cache key format

The cache server may be shared between different services, so the key in memcached is designed in below format to accomplish it:

service base url + space + json string (the real key which matters)