//"use strict";

var api = {
    //domain: 'https://joshpress.net/',
    domain: 'https://wptavern.com/',
    //domain:     'http://technicalwhining.com/',
    version:    'wp-json/wp/v2/'
};

$(document).ready(function () {

    // Build categories list
    var requestCategories = api.domain + api.version + 'categories/?hide_empty=1';

    $.getJSON(requestCategories, function (data) {
            $.each(data, function (i) {
                $('#category_list').append('<input type="checkbox" name="category" value="' + data[i].id + '">' + data[i].name + ' (' + data[i].count + ')<br />');
            });
        })
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log("Request Failed: " + err);
        });

    // Build tags list
    var requestTags = api.domain + api.version + 'tags/?hide_empty=1&per_page=50';

    $.getJSON(requestTags, function (data) {
            $.each(data, function (i) {
                $('#tag_list').append('<input type="checkbox" name="tag" value="' + data[i].id + '">' + data[i].name + ' (' + data[i].count + ')<br />');
            });
        })
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log("Request Failed: " + err);
        });

});

$(window).load(function () {


    //    <input type="checkbox" name="animal" value="Bird" />Birds<br />



});

function makeRequest(e) {
    e.preventDefault();

    // Clear the preview results
    $('#preview_panel').empty();

    var limit       = (this.querySelector('[name=limit]')).value,
        displayType = parseInt((this.querySelector('[name=display-type]')).value);
        
    var query,
        excerpt,
        htmlString,
        title       = '';
    
    var categories  = '';
    var tags        = '';
    
    // Get checked tags
    if ($('input[name="tag"]:checked').length > 0) {
        var tagList = [];
        $('input[name="tag"]:checked').each(function () {
            tagList.push(this.value);
        });
        tags = 'tags=' + String(tagList);
    }

    // Get checked categories
    if ($('input[name="category"]:checked').length > 0) {
        var categoryList = [];
        $('input[name="category"]:checked').each(function () {
            categoryList.push(this.value);
        });
        categories = 'categories=' + String(categoryList);
    }
    
    // Join filters if needed
    if (tags && categories) {
        query = tags + '&' + categories;
    } else {
        query = tags + categories;
    }
    
    // Add embedded resources for thumbnail
    if (displayType == 3) {
        query += '&_embed';
    }

    var apiRequest  = api.domain + api.version + 'posts/?' + query + '&orderby=date';

    console.log(apiRequest);
    
    $.getJSON(apiRequest)
        .success(function (json) {

            // This really needs to be a separate fucntion
            var htmlString = '';
        
            switch (displayType) {
            // Title only
            case 1:
                htmlString += '<ul>';
                $.each(json, function (i) {
                    htmlString += '<li>'
                        + json[i].title.rendered
                        + '</li>';
                });
                htmlString += '</ul>';
                break;
            // Excerpt
            case 2:
                $.each(json, function (i) {
                    htmlString += '<h3>'
                        + json[i].title.rendered
                        + '</h3>'
                        + json[i].excerpt.rendered;
                });
                    console.log(htmlString);
                break;
            // Excerpt w/ thumbnail    
            case 3:
                $.each(json, function (i) {

                    // Get thumbnail
                    if (json[i].featured_media > 0) {
                        
                        // console.log(json[i]._embedded.wp:featuredmedia.media_details.sizes.thumbnail.source_url);
                        
                        $.ajax({
                            type: 'GET',
                            url: api.domain + api.version + 'media/?include=' + json[i].featured_media,
                            dataType: 'json',
                            success: function (data) {
                                htmlString += '<img src="'
                                    + data[0].media_details.sizes.thumbnail.source_url
                                    + '" width="'
                                    + data[0].media_details.sizes.thumbnail.width
                                    + '" height="'
                                    + data[0].media_details.sizes.thumbnail.height
                                    + '" />';
                            },
                            async: false
                        });

                    }
                    
                    htmlString += '<h3>'
                        + json[i].title.rendered
                        + '</h3>'
                        + json[i].excerpt.rendered;
                    
                });
                break;
            }
        
            $('#preview_panel').append(htmlString);
        
        })
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ', ' + error;
            $('#preview_panel').append('Request Failed: ' + err);
        });
}

var configure = document.querySelector('.configure-request');
configure.addEventListener('submit', makeRequest);


   