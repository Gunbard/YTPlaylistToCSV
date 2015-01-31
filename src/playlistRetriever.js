/**
 PlaylistRetriever
 A class that retrieves playlist data from YouTube.
 Requires an API key. Set API_KEY before using this class.
 The key has been separated into api.js and loaded externally
 to prevent it from being indexed on SCM.
 */
 
PlaylistRetriever = function () 
{
    // Private
    
    /**
     Enum of status codes
     */
    const STATUS_CODES =
    {
        NO_CONNECTION: 1,
        BAD_FORMAT: 2
    };
    
    /**
     YouTube url prefix
     */
    const YOUTUBE_WATCH_URL = "https://www.youtube.com/watch?v=";
    
    /**
     Maximum number of results to be obtained at a time
     */
    const YOUTUBE_API_MAX_RESULTS = 50;
    
    /**
     A list of playlist items
     */
    var playlistItems = [];
    
    /**
     The total number of items to process
     */
    var totalItems = 0;
    
    /**
     Optional callback function when data is retrieved
     @param {number} Current number of processed items
     @param {number} Total number of processed items
     */
    var onDataUpdate = null;
    
    /**
     Executes an AJAX call for YouTube API v3 and dumps playlist data 
     into playlistItems. Will execute recursively if more than 50 results
     are available.
     @param playlistId {string} The id of the playlist to get
     @param nextPageToken {string} Used to get the next set of data, if available
     @param callback {function} Called when finished
     */
    function getPlaylistData(playlistId, nextPageToken, callback)
    {
        var queryData = 
        {
            part: 'snippet',
            maxResults: YOUTUBE_API_MAX_RESULTS,
            playlistId: playlistId,
            key: API_KEY
        };
        
        if (nextPageToken)
        {
            queryData.pageToken = nextPageToken;
        }
        
        $.ajax
        ({
            type: 'get',
            url: 'https://www.googleapis.com/youtube/v3/playlistItems',
            dataType: 'jsonp',
            data: queryData,
            success: function (response) 
            {
                // Process data
                if (!response.items)
                {
                    callback(STATUS_CODES.BAD_FORMAT);
                    return;
                }
                
                totalItems = response.pageInfo.totalResults;
                
                for (var i = 0; i < response.items.length; i++)
                {
                    var snippet = response.items[i].snippet;
                    var dateAdded = snippet.publishedAt;
                    var videoId = snippet.resourceId.videoId;
                    var title = snippet.title;
                    var newItem = 
                    {
                        url: YOUTUBE_WATCH_URL + videoId,
                        date: dateAdded,
                        title: title
                    };
                    playlistItems.push(newItem);
                }
                
                
                // Execute again if nextPageToken is available, otherwise call callback
                if (!response.nextPageToken)
                {
                    callback();
                }
                else
                {
                    console.log(response.nextPageToken);
                    
                    if (onDataUpdate)
                    {
                        onDataUpdate(playlistItems.length, totalItems);
                    }
                    
                    getPlaylistData(playlistId, response.nextPageToken, callback);
                }
            },
            error: function (error)
            {
                callback(STATUS_CODES.NO_CONNECTION);
            }
        });
    }
    
    // Public
    return { 
        
        /**
         Setter for onDataUpdate event
         */
        onDataUpdate: function (callback)
        {
            onDataUpdate = callback;
        },
        
        /**
         Enum getter for status codes
         */
        statusCodes: function ()
        {
            return STATUS_CODES;
        },
    
        /**
         Obtains playlist data
         @param playlistId {string} The id of the playlist
         @param callback {function} Called when finished obtaining data
         @returns {number, array} An array containing playlist item data, or 
                                  a status code if something happened
         */
        retrievePlaylistItems: function (playlistId, callback)
        {
            playlistItems = [];
            totalItems = 0;
            
            getPlaylistData(playlistId, null, function (status)
            {
                if (status > 0)
                {
                    callback(status);
                }
                else
                {
                    callback(playlistItems);
                }
            });
        }
    };
};