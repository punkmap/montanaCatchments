var HUCMeta,
    activeRecord = {},
    defaultMeasure = "Arsenic",
    activeMeasure = defaultMeasure,
    wsbase = "http://maps.co.mecklenburg.nc.us/rest/",
    map,
    mapDataURL = "js/huc12data.json?V=22",
    jsonData,
    geojson,
    info,
    legend,
    marker,
    chart;

//popup disclaimer
$('#modalDisclaimer').modal('show');

//document loads and runs the following functions    
$(document).ready(function() {
  
  	//load the metrics here and set the metadata. 
  	//this function is very important. metricsHUCsDEV.json is referenced throughout the application 
  	// to determine how to load the "Why it Matters", "Additional Resources", and "About the Data" sections
  	//Additionally, the color values for the choropleth maps and break points are set in the metricsHUCsDEV.json file
  	//the following is an example of a metric below with each property explained:
  	// "Arsenic": { //set to metric field heading in huc12data.json
        // "db": "Arsenic", //set to metric field heading in huc12data.json
        // "field": "Arsenic", //set to metric field heading in huc12data.json
        // "category": "impairments", //set to the data group attribute in index.html, Look for SetDataGroupHere in index.html 
        // "title": "Arsenic Impairment",//html title for metric is assigned here.
        // "description": "Linear feet of streams listed for arsenic per 12 digit HUC.",//this text is the description placed right above the chart
        // "importance": "Arsenic levels are quantified per 12 digit HUCs based on linear feet of arsenic impairment.",//this populates the Why is this important? section of the application. 
        // "tech_notes": "Though linear feet of impairment may not be the most robust indicator for arsenic, the geographic data made available in the U.S. EPA 303(d) list are leveraged to highlight the the use of this technology. 12 digit HUCs are used as the target layer for cross-metric comparisson. Additional datasets can be processed to the HUC 12 dataset to satisfy demands for analysis, data display, and security.",//this section populates the About the Data section
        // "source": "U.S. EPA 303(d) List",// this section adds source information to the About the Data section
        // "links": "<a href='http://water.epa.gov/scitech/datait/tools/waters/data/downloads.cfm#303(d)%20Listed%20Impaired%20Waters'>303(d) Listed Impaired Waters</a><br><a href='http://datagateway.nrcs.usda.gov/Catalog/ProductDescription/WBD.html'>Watershed Boundary Dataset</a><br><a href='http://water.epa.gov/lawsregs/lawsguidance/cwa/tmdl/overview.cfm'>Total Maximum Daily Loads (303d)</a>",//this populates the Additional Resources links in the application
        // "style": {
        	// //look at one of the fire condition class metrics for an example of how the units properties are applied. 
            // "breaks": [ //this section populates the breakpoints for the data. currently the application accepts the lower bounds but not the upper bounds. 
                // 0,
                // 40000,
                // 75000
            // ],
            // "colors": [//hexidecimal values are set here
                // "#D8F2ED",
                // "#2ca79e",
                // "#154F4A"
            // ]
        // }
    // },
    $.ajax({
        url: "js/metricsHUCsDEV.json?V=22",
        dataType: "json",
        async: false,
        success: function(data){
            HUCMeta = data;
        }
    });
    
    //mapDataURL = "js/huc12data.json?V=22",
    //this is the geojson with the watershed geometry and attributes. 
    $.ajax({
        url: mapDataURL,
        dataType: "json",
        type: "GET",
        async: false,
        success: function(data) {
           jsonData = data;
        }
    });

    $('input, textarea').placeholder();

	//this section loads the individual metrics into the side bar navigation (table of contents section on the left hand side of the application)
    //this section also loads the individual metrics into the report popup which is not implimented
    $.each(HUCMeta, function(index) {
        if (this.style.breaks.length > 0) {
        	//<a href="javascript:void(0)" class="list-group-item">Dapibus ac facilisis in</a>
            console.log("the category is = " + this.category);
            if (this.category=="impairments"){
            	var defaultHash = "#/"+defaultMeasure+"/";
            	if (this.field == defaultMeasure && window.location.hash.length == 0){
            		$('#metricsList').append('<a href="javascript:void(0)" class="list-group-item active" data-measure="' + this.field + '">' + this.title + '</a>');
            	}
            	else{
            		$('#metricsList').append('<a href="javascript:void(0)" class="list-group-item" data-measure="' + this.field + '">' + this.title + '</a>');
            	}
            }
            // $('#modalReport optgroup[label=' + this.category.toProperCase() + ']').append('<option value="' + this.field + '">' + this.title + '</option>');
        }
    });
    $(".sidenav p").each(function() {
        $("li", this).tsort();
    });
    
     $("#modalReport optgroup").each(function() {
        $("option", this).tsort();
    });

	//sets event listeners for the reoprts
    $("#report_metrics optgroup").click(function(e) { $(this).children().prop('selected','selected');  });
    $("#report_metrics optgroup option").click(function(e) { e.stopPropagation(); });
    $("#all_metrics").change(function () {
        $(this).is(":checked") ? $("#report_metrics optgroup option").prop('selected','selected') : $("#report_metrics optgroup option").prop('selected', false);
    });
    
    //load the default measure into the applicaiton(map, metadata and chart).
    updateData(HUCMeta[defaultMeasure]);
    calcAverage(defaultMeasure);
    barChart(HUCMeta[defaultMeasure]);
    $('a[data-measure=' + defaultMeasure + ']').children("i").addClass("icon-chevron-right");
    
    //set up event listeners for clicking on individual metrics in the sidebar navigation 
    // $("a.list-group-item").on('touchstart mousedown', function(e) {
        // if ( $(window).width() <= 767 ) $('html, body').animate({ scrollTop: $("#data").offset().top }, 1000);
        // activeMeasure = $(this).data("measure");
        // changeMeasure( $(this).data("measure") );
        // e.stopPropagation();
    // });
    $(".sidenav li p").on("click", function(e) { e.stopPropagation(); });
    //click events for clicking on metric headers
    $(".sidenav li.metrics-dropdown").on("click", function() {
        $(this).addClass("active").siblings().removeClass("active");
        $(this).siblings().children("p").each(function(){
            
            if (!$(this).is(':hidden')) $(this).animate({ height: 'toggle' }, 250);
        });
        $(this).children("p").animate({ height: 'toggle' }, 250);
    });
    
    $(".talkback").click(function() {
        $('#modalHelp').modal('hide');
        $('#modalTalkback').modal('show');
    });
    
	//GPS locate 
    $(".gps").click(function() {
    	
    	//TODO - add point to gps location 
    	//currently no location is identified 
    	//the map frame only moves to the location of the device no point is placed
        map.locate({ setView: true });
    });
	
	//event listener for clicking the overview - zooms to the starting extent
    $(".show-overview").on("click", function(){ resetOverview(); });

	$("#metricsList").children().on("click", function(){
		$("#metricsList").children().removeClass("active");
		$(this).addClass("active");
		activeMeasure = $(this).data("measure");
        changeMeasure( $(this).data("measure") );
        e.stopPropagation();
		console.log("metricslistClicked");
	});

    $('*[rel=popover]').popover();
    $(".popover-trigger").hoverIntent( function(){
            if ( $(window).width() > 979 ) $( $(this).data("popover-selector") ).popover("show");
        }, function(){
            $( $(this).data("popover-selector") ).popover("hide");
        }
    );

    $(window).smartresize( function() {
        if ( $("#details_chart svg").width() !== $("#data").width() ) barChart(HUCMeta[activeMeasure]);
    });
    
    //opacity slider 
    $( "#opacity_slider" ).slider({ range: "min", value: 80, min: 25, max: 100, stop: function (event, ui) {
              geojson.setStyle(Style);
              if (activeRecord.id) highlightSelected( getLayer(activeRecord.id) );
              legend.update();
    }
    }).sliderLabels('Map','Data');

	//feedback submit event listeners here
	//when implimented this should feed back into a database for later analysis
    $("#talkback").submit(function(e){
        e.preventDefault();
        $('#modalTalkback').modal('hide');
        $.ajax({
            type: "POST",
            url: "php/feedback.php",
            data: { inputName: $("#inputName").val(), inputEmail: $("#inputEmail").val(), inputURL: window.location.href, inputFeedback: $("#inputFeedback").val() }
        });
    });

	//auto complete does not work
    // $.widget( "custom.catcomplete", $.ui.autocomplete, {
        // _renderMenu: function( ul, items ) {
            // var that = this,
                // currentCategory = "";
            // $.each( items, function( index, item ) {
                // if ( item.category != currentCategory ) {
                    // ul.append( "<li class='ui-autocomplete-category'>" + item.responsetype + "</li>" );
                    // currentCategory = item.category;
                // }
                // that._renderItemData( ul, item );
            // });
        // }
    // }); 
    
    //geocode does not work
    $(".geocodeButton").click(function(e) {
        
        var address = document.getElementById('searchbox').value.toUpperCase();
        geocoder = new google.maps.Geocoder(); 
        geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {

            var marker = L.marker([results[0].geometry.location.lat(),results[0].geometry.location.lng()]).addTo(map);
            map.panTo([results[0].geometry.location.lat(),results[0].geometry.location.lng()]);
            map.setZoom(16);
            

        } else {
            $('#result').html('Geocode was not successful for the following reason: ' + status);
        }
      }); 
    });
});

$(window).load(function(){
    mapInit();
	hashRead();
    window.addEventListener("hashchange", hashRead, false);
});

//url hash change updated here
function hashChange(measure, record) {
    window.location.hash = "/" + measure + "/" + record;
}

function hashRead() {
    if (window.location.hash.length > 1) {
        var record, measure;
        record = activeRecord;
        measure = activeMeasure;
        
        theHash = window.location.hash.replace("#","").split("/");

        if (theHash[2] && theHash[2].length > 0 && parseInt(theHash[2],10) !== record.id) {
            if (theHash[2].indexOf(",") == -1) {
                //
                changeWatershed(theHash[2], true);
                var layer = getLayer(theHash[2]);
                zoomToFeature(layer.getBounds());
            }
            else {
                coords = theHash[2].split(",");
                performIntersection(coords[0], coords[1]);
            }
        }

        if (theHash[1].length > 0) {
            // if ( $('a[data-measure=' + theHash[1] + ']').parent("li").parent("p").is(':hidden') ) $('a[data-measure=' + theHash[1] + ']').parent("li").parent("p").parent("li").trigger("click");
            // $("a.measure-link").children("i").removeClass("icon-chevron-right");
            $('a[data-measure=' + theHash[1] + ']').addClass("active");
            //
            changeMeasure(theHash[1]);
        }
    }
}
//set the map back to overview when the Overview button is clicked on the left hand side
function resetOverview() {
    $(".measure-info").hide();
    $(".overview").show();
    activeRecord = {};
    barChart(HUCMeta[activeMeasure]);
    geojson.setStyle(Style);
    map.setView([46.50, -112],8);
    hashChange(activeMeasure, "");
}
//When the changeMeasure is clicked
function changeMeasure(measure) {
    activeMeasure = measure;
    if (!HUCMeta[activeMeasure].style.avg) calcAverage(activeMeasure);
    geojson.setStyle(Style);
    legend.update();
    info.update();
    var layer = getLayer(activeRecord.id);
    updateData(HUCMeta[activeMeasure]);
    if (activeRecord.id) highlightSelected(layer);
    hashChange(activeMeasure, activeRecord.id ? activeRecord.id : "");
}

//when a watershed is changed
function changeWatershed(nhid) {
    var layer = getLayer(nhid);
    assignData(layer.feature.properties);
    //$(".overview").hide();
    $(".measure-info").show();
    updateData(HUCMeta[activeMeasure]);
    highlightSelected(layer);
    hashChange(activeMeasure, activeRecord.id ? activeRecord.id : "");
}

function assignData(data) {
    $.each(data, function(key, value){
        activeRecord[key] = value;
    });
}
function updateData(measure) {
    if (activeRecord.id) {
        $("#selectedWatershed").html("HUC12 ID:" + activeRecord.HUC_12);
        $("#selectedWatershedValue").html( prettyMetric(activeRecord[measure.field], activeMeasure) );
    }
    barChart(measure);
    $("#selectedWatershedMeasure").html(measure.title);
    $("#indicator_description").html(measure.description);
    $("#measure_importance").html(measure.importance);
    $("#measure_technical").empty();
    if (measure.tech_notes && measure.tech_notes.length > 0) $("#measure_technical").append('<p>' + measure.tech_notes + '</p>');
    if (measure.source && measure.source.length > 0) $("#measure_technical").append('<p>' + measure.source + '</p>');
    $("#measure_links").empty();

    if (measure.quicklinks) {
        quicklinks = [];
        $.each(measure.quicklinks, function(index, value) {
            quicklinks[index] = '<a href="javascript:void(0)" class="quickLink" onclick="changeMeasure(\'' + value + '\')">' + HUCMeta[value]["title"] + '</a>';
        });
        $("#measure_links").append("<h5>Related Variables</h5><p>" + quicklinks.join(", ") + "</p>");
    }

    if (measure.links) {
        $("#measure_links").append(measure.links);
    }

    $("#welcome").hide();
    $("#selected-summary").show();
}

function barChart(measure){
    var data, theTitle, theColors;
    if (jQuery.isEmptyObject(activeRecord) || activeRecord[activeMeasure] === null) {
        data = google.visualization.arrayToDataTable([
            ['', 'Dataset Average'],
            ['',  Math.round(HUCMeta[measure.field].style.avg) ]
        ]);
        theTitle = prettyMetric(Math.round(HUCMeta[measure.field].style.avg), activeMeasure);
        theColors = ["#DC3912"];
    }
    else {
        data = google.visualization.arrayToDataTable([
            ['', '12 Digit Watershed' + activeRecord.HUC_12, 'Dataset Average'],
            ['',  parseFloat(activeRecord[measure.field]), Math.round(HUCMeta[measure.field].style.avg) ]
        ]);
        theTitle = prettyMetric(activeRecord[measure.field], activeMeasure);
        theColors = ["#0283D5", "#DC3912"];
    }

    var options = {
      title: theTitle,
      titlePosition: 'out',
      titleTextStyle: { fontSize: 14 },
      //vAxis: { title: null,  titleTextStyle: {color: 'red'}},
      hAxis: { format: "#", minValue: HUCMeta[measure.field].style.breaks[0] },
      width: "95%",
      height: 150,
      legend: 'bottom',
      colors: theColors,
      chartArea: { left: 20, right: 20, width: '100%' }
    };
    if (!chart) chart = new google.visualization.BarChart(document.getElementById('details_chart'));
    chart.draw(data, options);
}


function mapInit() {
	//create a leaflet map
	map = new L.Map('map', {
        center: [46.50, -112],
        zoom: 8
    });
    map.attributionControl.setPrefix(false).setPosition("bottomleft");
    //set basemep here
    var url = 'http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.png';
    var attrib = 'Data, imagery and map information provided by <a href="http://open.mapquest.co.uk" target="_blank">MapQuest</a>, <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> and contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">CC-BY-SA</a>';
    L.tileLayer(url, {maxZoom: 18}).addTo( map );
    
    L.control.fullscreen({
	  position: 'topleft', // change the position of the button can be topleft, topright, bottomright or bottomleft, defaut topleft
	  //title: 'Show me the fullscreen !', // change the title of the button, default Full Screen
	  forceSeparateButton: true // force seperate button to detach from zoom buttons, default false
	  //forcePseudoFullscreen: true // force use of pseudo full screen even if full screen API is available, default false
	}).addTo(map);
	
	//if you want to add attribution to the map frame use the following line instead of the previous line
    // L.tileLayer(url, {maxZoom: 18, attribution: attrib}).addTo( map );
	
	// var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	// var osmAttrib='Map data © OpenStreetMap contributors';
	// var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 12, attribution: osmAttrib});
    geojson = L.geoJson(jsonData, { style: Style, onEachFeature: onEachFeature })
    map.addLayer(geojson);
    // if (!Modernizr.geolocation) $(".gpsarea").hide();
    map.on('locationfound', function(e) {
        var radius = e.accuracy / 2;
        performIntersection(e.latlng.lat, e.latlng.lng);
    });
    info = L.control();
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };
    info.update = function (props) {
        this._div.innerHTML = '<h4>' + HUCMeta[activeMeasure].title + '</h4>' +  (props && props[activeMeasure] != undefined ?
              'HUC 12: ' + props.HUC_12 + ': ' + prettyMetric(props[activeMeasure], activeMeasure) + '<br>Average: ' + prettyMetric(HUCMeta[activeMeasure].style.avg, activeMeasure) :
              props && props[activeMeasure] == undefined ? 'HUC 12: ' + props.HUC_12 + '<br />No data available.' :
              '');
    };
    info.addTo(map);

    // Legend
    legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info legend');
        this.update();
        return this._div;
    };
    legend.update = function() {
      // alert("legend.update = " + activeLayer);
        var theLegend = '<i style="background: #666666; opacity: ' + ($("#opacity_slider").slider( "option", "value" ) + 10) / 100 + '"></i> <span id="legend-">N/A</span><br>';
        $.each(HUCMeta[activeMeasure].style.breaks, function(index, value) {
            theLegend += '<i style="background:' + HUCMeta[activeMeasure].style.colors[index] + '; opacity: ' + ($("#opacity_slider").slider( "option", "value" ) + 10) / 100 + '"></i> <span id="legend-' + index + '">' +
                prettyMetric(value, activeMeasure)  + (HUCMeta[activeMeasure].style.colors[index + 1] ? '&ndash;' + prettyMetric(HUCMeta[activeMeasure].style.breaks[index + 1], activeMeasure) + '</span><br>' : '+</span>');
        });
        this._div.innerHTML = theLegend;  
    };
    legend.addTo(map);
}


function zoomToFeature(bounds) {
    map.fitBounds(bounds);
}

function createLatLngBounds(coordinates){
  var coord, xmin, xmax, ymin, ymax;
  for (var i = 0; i < coordinates.length; i++) {
    coord = coordinates[i];
    if (coord.toString().indexOf("-")==-1&&coord!=0){
      var y = coord
      if (!ymin || y < ymin){
        ymin = y;
      }
      else if(!ymax||y>ymax){
        ymax = y;
      }
    }
    else if (coord.toString().indexOf("-")!=-1&&coord!=0){
      var x = coord
      if (!xmin || x < xmin){
        xmin = x;
      }
      else if(!xmax||x>xmax){
        xmax = x;
      }
    }
  }
  var southWest = new L.LatLng (ymin, xmax);
  var northEast = new L.LatLng(ymax, xmin);
  var bounds = new L.LatLngBounds(southWest, northEast);
  return bounds;
}
function addMarker(lat, lng) {
    if (marker) {
        try { map.removeLayer(marker); }
        catch(err) {}
    }
    marker = L.marker([lat, lng]).addTo(map);
}

function performIntersection(lat, lon) {
    url = wsbase + 'v1/ws_geo_pointoverlay.php?geotable=datatablr&callback=?&format=json&srid=4326&fields=id&parameters=&x=' + lon + '&y=' + lat;
    $.getJSON(url, function(data) {
        if (data.total_rows > 0) {
            changeWatershed(data.rows[0].row.id);
            addMarker(lat, lon);
            var layer = getLayer(data.rows[0].row.id);
            zoomToFeature(layer.getBounds());
        }
    });
}
function getLayer(idvalue) {
    var layer;
    $.each(geojson._layers, function() {
        if (this.feature.properties.id == idvalue) layer = this;
    });
    return layer;
}
function locationFinder(data) {
    performIntersection(data.lat, data.lng);
}
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: selectFeature
    });
}
function Style(feature) {
    return {
        fillColor: getColor(feature.properties[activeMeasure]),
        weight: 1,
        opacity: 1,
        color: '#f5f5f5',
        fillOpacity: $("#opacity_slider").slider("value") / 100
    };
}
function getColor(d) {
    var color = "";
    var colors = HUCMeta[activeMeasure].style.colors;
    var breaks = HUCMeta[activeMeasure].style.breaks;
    $.each(breaks, function(index, value) {
        if (value <= d && d !== null) {
            color = colors[index];
            return;
        }
    });
    if (color.length > 0) return color;
    else return "#666666";
}
function highlightFeature(e) {
    var layer = e.target;
    if (!activeRecord || (activeRecord && activeRecord.id != e.target.feature.properties.id)) layer.setStyle({
        weight: 3,
        color: '#ffcc00'
    });
    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}
function resetHighlight(e) {
    var layer = e.target;
     if (!activeRecord || (activeRecord && activeRecord.id != layer.feature.properties.id)) layer.setStyle({
        weight: 1,
        color: '#f5f5f5'
    });
    info.update();
}
function highlightSelected(layer) {
    geojson.setStyle(Style);
    layer.setStyle({
        weight: 7,
        color: '#0283D5',
        dashArray: ''
    });
    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
}
function selectFeature(e) {
    var layer = e.target;
    changeWatershed(layer.feature.properties.id);
    zoomToFeature(layer.getBounds());
}
var lastLayer;
function resetLastLayer(){
    if(lastLayer){
        lastLayer.setStyle({
          weight: 1,
          color: '#f5f5f5'
        });
    }
}
