/**
 Youtube Playlist CSV Generator
 Version: 0.1
 Author: Gunbard
 License: MIT
 
 Browser-based application to generate a CSV file containing data from
 a YouTube playlist. Can run locally and in most modern browsers.
 Tested on Firefox 35 and Chrome 40
 
 Output data format:
 video title, date added to playlist, video url
 */
 
/********
 HELPERS
 *******/
 
/**
 Generates text file to download
 @param filename {string} Name of the file
 @param text {string} The file's text data
 @param autoclick {bool} Generate a download link if false, otherwise will auto-start
                         download depending on browser settings.
 */
function generateTextFileDownload(filename, text, autoclick) 
{
    var blob = new Blob([text], {type: 'text/plain'});
    var textUrl = URL.createObjectURL(blob);
    
    var $tempAnchor = $('<a>').attr
    (
        {
            id: 'csvDownload',
            href: textUrl,
            download: filename,
            style: 'display: none'
        }
    );
    
    $tempAnchor.text('Download CSV');
    $('#container').append($tempAnchor);
    
    if (!autoclick)
    {
        $tempAnchor.css({display: ''});
    }
    else 
    {
        $tempAnchor.click(function ()
        {
            $(this).remove();
        });
        
        $tempAnchor[0].click();
    }
}
 
/***********
 BEGIN MAIN
 **********/
 
// Configure events
$('#progressBar').progressbar();
$('#totalProgressBar').progressbar();

$('#btnGet').click(function ()
{
    var id = $('#textInput').val();
    if (id.length > 0)
    {
        $('#btnGet').prop('disabled', true);
        $('#csvDownload').remove();
        
        // Handle both full url and just id
        var fullUrl = id.match(/list\=(.*)/);
        if (fullUrl)
        {
            id = fullUrl[1];
        }
        
        // Reset UI
        $('#progressBar').progressbar({value: false});
        $('#totalProgressBar').progressbar({value: 0});
        $('.progress-label').text('Starting...');
    
        var retriever = new PlaylistRetriever();
        
        // Set data update handler to update the progress bars
        retriever.onDataUpdate(function (items, totalItems)
        {
            var progress = Math.floor((items / totalItems) * 100);
            $('#totalProgressBar').progressbar({value: progress});
            $('.progress-label').text(progress + '%' + ' (' + items + '/' + totalItems + ')');
        });
        
        retriever.retrievePlaylistItems(id, function (data)
        {
            // Finish UI
            $('#btnGet').prop('disabled', false);
            $('#progressBar').progressbar({value: true});
            $('#totalProgressBar').progressbar({value: 100});
            $('.progress-label').text('Done!');

            // Handle errors
            if (data.constructor !== Array)
            {
                $('.progress-label').text('I am Error');
            
                if (data === retriever.statusCodes().NO_CONNECTION)
                {
                    alert("Error: Couldn't connect to YouTube");
                }
                else if (data === retriever.statusCodes().BAD_FORMAT)
                {
                    alert("Error: Playlist url/id is invalid");
                }
                
                return;
            }
            
            // Generate a basic csv file from the data
            var csvData = 'Title, Date, URL\n';
            for (var i = 0; i < data.length; i++)
            {
                csvData += '"' + data[i].title + '", ' + 
                           data[i].date + ', ' + 
                           data[i].url + '\n';  
            }
            
            var shouldAutostart = $('#chkAutostart').is(':checked');
            generateTextFileDownload('playlist.csv', csvData, shouldAutostart);
        });
    }
});
