# YTPlaylistToCSV
Successor to YTPlaylistGrabber.
Gets YouTube playlist data and generates a basic CSV file. Can be run locally. 
Zip archive includes key for YouTube's API and was added to SCM won't index it.
Tested on Firefox 35 and Chrome 40. Can be run locally.

####Usage
Just open index.html in a modern browser. Enter a url or id to a YouTube playlist and press GET. A download for the CSV will automatically be generated when finished.

####CSV format
```
title, date added to playlist (if available), video url
```

####Version history
0.1: Initial version

####Notes
Uses JQuery, JQuery UI, and YouTube API v3.

####License
MIT

