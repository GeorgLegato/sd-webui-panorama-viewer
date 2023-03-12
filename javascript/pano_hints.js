// mouseover tooltips for various UI elements

pano_titles = {
    "Pano 👀":"Send to Panorama Viewer Tab",
    "Pano 🌐": "Switch between selected image and panorama view"
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
