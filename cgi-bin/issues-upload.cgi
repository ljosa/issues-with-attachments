#!/usr/bin/env python
# -*- Mode: python -*-

import os
import sys
import cgi
import string
import tempfile


def fbuffer(f, chunk_size=10000):
   while True:
      chunk = f.read(chunk_size)
      if not chunk: 
      	 break
      yield chunk

form = cgi.FieldStorage()
fileitem = form['file']

_safechars = '_-.()' + string.digits + string.ascii_letters
_allchars = string.maketrans('', '')
_deletions = ''.join(set(_allchars) - set(_safechars))

directory = tempfile.mkdtemp(prefix='', 
                             dir=os.path.dirname(sys.argv[0]) + '/../issues/uploaded/')
bn = string.translate(fileitem.filename, _allchars, _deletions)
safe_filename = os.path.join(directory, bn)
out = open(safe_filename, 'wb')
for chunk in fbuffer(fileitem.file):
   out.write(chunk)
out.close()

url = 'http://cellprofiler.org/issues/uploaded/' + os.path.basename(directory) + '/' + bn
print 'Status: 200 OK\r\n\r\n{ "url": "' + url + '" }'

