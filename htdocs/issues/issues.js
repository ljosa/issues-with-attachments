// Get a parameter from the page's URL
function getParameterByName(name)
{
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.href);
  if(results == null)
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}

// Identifies this application to Github
var clientID = '24d876fc9dffb463ae06';

$(document).ready(function() {
		      var access_token = getParameterByName('access_token');
		      if (!access_token) {
			  var url = 'https://github.com/login/oauth/authorize?scope=public_repo&client_id=' + clientID;
			  $('#login a').attr('href', url);
			  $('#login').show();
		      } else {
			  var uploader = new plupload.Uploader({runtimes: 'html5,flash,gears,silverlight,html4',
								browse_button: 'pickfiles',
								container: 'container',
								url: '../cgi-bin/issues-upload.cgi',
								flash_swf_url : 'plupload/js/plupload.flash.swf',
								silverlight_xap_url: 'plupload/js/plupload.silverlight.xap'});
			  uploader.bind('Init', function (up, params) {
					    $('#runtime').html("<div>Current runtime: " + params.runtime + "</div>");
					});
			  $('#uploadfiles').click(function(e) {
						      uploader.start();
						      e.preventDefault();
						  });
			  uploader.init();

			  uploader.bind('FilesAdded', function(up, files) {
					    $.each(files, function(i, file) {
						       $('#filelist').append(
							   '<div id="' + file.id + '">' +
							       file.name + ' (' + plupload.formatSize(file.size) + ') <b></b>' +
							       '</div>');
						   });
					    
					    up.refresh(); // Reposition Flash/Silverlight
					});
 
			  uploader.bind('UploadProgress', function(up, file) {
					    $('#' + file.id + " b").html(file.percent + "%");
					});
 
			  uploader.bind('Error', function(up, err) {
					    $('#filelist').append("<div>Error: " + err.code +
								  ", Message: " + err.message +
								  (err.file ? ", File: " + err.file.name : "") +
								  "</div>"
								 );
 
					    up.refresh(); // Reposition Flash/Silverlight
					});
 
			  uploader.bind('FileUploaded', function(up, file, response) {
					    $('#' + file.id + " b").html("100%");
					    file.response = response.response;
					});

			  uploader.bind('UploadComplete', function(up, files) {
					    var body = $('textarea[name=body]').val();
					    $.each(files, function (i, f) {
						       if (i == 0)
							   body = body + '\r\n\r\nAttachments:';
						       body = body + '\r\n' + JSON.parse(f.response).url;
						       });
					    var data = {title: $('input[name=title]').val(),
							body: body};
					    var repo = $('#repo_select').val();
					    var url = 'https://api.github.com/repos/CellProfiler/' + repo + '/issues?access_token=' + access_token;
					    $('.error_message').html('');
					    $('.spinner').show();
					    $.ajax({url: url,
						    type: 'POST',
						    data: JSON.stringify(data),
						    dataType: 'json',
						    success: function (data, textStatus, jqXHR) {
							$('.spinner').hide();
							window.location = data.html_url;
						    },
						    error: function (jqXHR, textStatus, errorThrown) {
							$('.spinner').hide();
							var s = jqXHR.status + ' ' + errorThrown;
							$('.error_message').text(s);
							$('.error_message').text(jqXHR.responseText.message);
						    }});
					});

			  function onSubmit (event) {
			      event.preventDefault();
			      uploader.start();
			  }
			  
			  $('form').bind('submit', onSubmit);
			  $('form input[type=submit]').bind('click', onSubmit);

			  $.get('https://api.github.com/orgs/CellProfiler/repos', 
				undefined, function (data, textStatus, jqXHR) {
				    $.each(data, function (i, repo) {
					       var el = $('<option></option>');
					       el.html(repo.name);
					       el.attr('name', repo.name);
					       $('#repo_select').append(el);
					   });
				});

			  $('#enter').show();
		      }
		  });
