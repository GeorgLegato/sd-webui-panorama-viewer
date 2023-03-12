const openpanorama = {
	frame: null
};

let galImageDisp

function panorama_here(phtml) {
	return async () => {
		try {
			const tabContext = get_uiCurrentTab().innerText
			let  containerName
			switch (tabContext) {
				case "txt2img":
					containerName = "#txt2img_gallery_container"
					break;
				case "img2img":
					containerName = "#img2img_gallery_container"
				break;
				case "Extras":
					containerName = "#extras_gallery_container"
				break;
				default:
					console.warn ("PanoramaViewer: Unsupported gallery: " + tabContext)
					return
			}

			let galviewer = gradioApp().querySelector("#panogalviewer-iframe"+tabContext)
			let galImage = gradioApp().querySelector(containerName + " div > img")

			if (galviewer) {
				galviewer.parentElement.removeChild(galviewer)
				if (galImage) galImage.style.display=galImageDisp
				return
			}
			
			// select only single viewed gallery image, not the small icons in the overview
			if (!galImage) return
			
			let parent = galImage.parentElement

			let iframe = document.createElement('iframe');
			iframe.src = phtml
			iframe.id = "panogalviewer-iframe"+tabContext
			iframe.classList += "panogalviewer-iframe"
			iframe.setAttribute("panoimage",galImage.src);
			parent.appendChild(iframe);
			galImageDisp = galImage.style.display
			galImage.style.display="none"
		}
		catch
		{ }
	}
}

function panorama_send_image(dataURL, name = "Embed Resource") {
	openpanorama.frame.contentWindow.postMessage({
		type: "panoramaviewer/set-panorama",
		image: {
			dataURL: dataURL,
			resourceName: name,
		},
	});
}

function panorama_change_container(name) {
	openpanorama.frame.contentWindow.postMessage({
		type: "panoramaviewer/set-container",
		container: {
			name
		},
	});
}


function panorama_gototab(tabname = "Panorama Viewer", tabsId = "tabs") {
	Array.from(
		gradioApp().querySelectorAll(`#${tabsId} > div:first-child button`)
	).forEach((button) => {
		if (button.textContent.trim() === tabname) {
			button.click();
		}
	});
}


async function panorama_get_image_from_gallery() {
	var buttons = gradioApp().querySelectorAll(
		'[style="display: block;"].tabitem div[id$=_gallery] .gallery-item'
	);
	var button = gradioApp().querySelector(
		'[style="display: block;"].tabitem div[id$=_gallery] .gallery-item.\\!ring-2'
	);

	if (!button) button = buttons[0];

	if (!button)
		throw new Error("[panorama_viewer] No image available in the gallery");

	/* only use file url, not data url 
	
	const canvas = document.createElement("canvas");
		const image = document.createElement("img");
		image.src = button.querySelector("img").src;
	
	
		await image.decode();
	
		canvas.width = image.width;
		canvas.height = image.height;
	
		canvas.getContext("2d").drawImage(image, 0, 0);
	
		return canvas.toDataURL();
		*/
	return button.querySelector("img").src
}

function panorama_send_gallery(name = "Embed Resource") {
	panorama_get_image_from_gallery()
		.then((dataURL) => {
			// Send to panorama-viewer
			console.info("[panorama viewer] Using URL: " + dataURL)
			// Change Tab
			panorama_gototab();
			panorama_send_image(dataURL, name);

		})
		.catch((error) => {
			console.warn("[panoramaviewer] No image selected to send to panorama viewer");
		});
}


function openpanoramajs() {
	const frame = gradioApp().getElementById("panoviewer-iframe");
	openpanorama.frame = frame;
}

document.addEventListener("DOMContentLoaded", () => {
	const onload = () => {
		if (gradioApp().getElementById("panoviewer-iframe")) {
			openpanoramajs();
		} else {
			setTimeout(onload, 10);
		}
	};
	onload();
});
