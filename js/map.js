var map;
$(window).load(function(){
   console.log("windowLoad");
   mapinitialize();
});
function mapinitialize() {
    console.log("initialize");
    // bluemap = new L.TileLayer.WMS(GEOSERVERBASE + "/geoserver/phillystreetmap/wms",
    // {
        // layers: "phillystreetmap:Philly",
        // format: 'image/png',
        // attribution: ""
    // });
//     
	// map = new L.Map('map',
        // {
//             
            // layers: [bluemap],
            // zoomControl: true
        // });
	// map.fitBounds([
	    // [37.17, -77.51],
	    // [37.72, -77.49]
	// ]);
	
	map = new L.Map('map', {
        center: [37.5, -77.5],
        zoom: 10,
        minZoom: 9
    });
    
	terrainURL = 'http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.png';
	terrainLayer = L.tileLayer(terrainURL).addTo( map );
	
}
