const openpanorama = {
	frame: null
};

function panorama_send_image(dataURL, name = "Embed Resource") {
	openpanorama.frame.contentWindow.postMessage({
		type: "panoramaviewer/set-panorama",
		image: {
			dataURL,
			resourceName: name,
		},
	});
}

function panorama_gototab(tabname = "Panorama-3D-Viewer", tabsId = "tabs") {
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
    console.log("hello p360")
    panorama_get_image_from_gallery()
		.then((dataURL) => {
			// Send to panorama-viewer
			console.info("[panorama viewer] Using URL: " + dataURL)
			panorama_send_image(dataURL, name);

			// Change Tab
			panorama_gototab();
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
