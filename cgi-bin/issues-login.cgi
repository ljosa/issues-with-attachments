#!/usr/bin/env python
# -*- Mode: python -*-

import sys
import urllib
import subprocess
import urlparse
import cgi

form = cgi.FieldStorage()
if 'code' not in form:
   print 'Status: 401 Unauthorized\r\n\r\n'
   sys.exit(0)
code = form['code'].value

d = dict(client_id='XXXXXXXXXXXXXXXXXXXX',
         client_secret='XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
         code=code)
data =  urllib.urlencode(d)
args = ['curl', '-k', '-d', data, 'https://github.com/login/oauth/access_token']
p = subprocess.Popen(args, shell=False,
                     stdout=subprocess.PIPE)
response = p.stdout.read()
rd = dict([tuple(pair.split('=', 1)) for pair in response.split('&')])

if 'access_token' in rd:
   access_token = rd['access_token']
   print 'Status: 303 See other\r\nLocation: /issues/?' + urllib.urlencode(dict(access_token=access_token)) + '\r\n\r\n'
else:
   print 'Status: 500 Failed\r\n\r\nrd: %s\r\n' % repr(rd)

