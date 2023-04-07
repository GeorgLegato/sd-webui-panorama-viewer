// mouseover tooltips for various UI elements

pano_titles = {
    "Pano 👀":"Send to Panorama Viewer Tab",
    "🌐": "Switch between selected image and Equirectangular view",
    "🧊": "Switch between selected image and CubeMap view",
	"✜": "Convert current spherical map into cubemap (for better outpainting)",
	"💫": "Convert current cubemap to equirectangular map (for better upscaling)",
	"❌": "Close current panorama viewer"
}


onUiUpdate(function(){
	gradioApp().querySelectorAll('span, button, select, p').forEach(function(span){
		tooltip = pano_titles[span.textContent];

		if(!tooltip){
		    tooltip = pano_titles[span.value];
		}

		if(!tooltip){
			for (const c of span.classList) {
				if (c in pano_titles) {
					tooltip = pano_titles[c];
					break;
				}
			}
		}

		if(tooltip){
			span.title = tooltip;
		}
	})

	gradioApp().querySelectorAll('select').forEach(function(select){
	    if (select.onchange != null) return;

	    select.onchange = function(){
            select.title = pano_titles[select.value] || "";
	    }
	})
})
