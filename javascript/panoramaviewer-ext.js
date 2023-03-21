const openpanorama = {
	frame: null
};

let galImageDisp

function panorama_here(phtml, mode, buttonId) {
	return async () => {
		try {
			const tabContext = get_uiCurrentTab().innerText
			let containerName
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
					console.warn("PanoramaViewer: Unsupported gallery: " + tabContext)
					return
			}

			let galviewer = gradioApp().querySelector("#panogalviewer-iframe" + tabContext)
			let galImage = gradioApp().querySelector(containerName + " div > img")

			if (galviewer) {
				// not the tab... openpanorama.frame.contentWindow.postMessage({

				galviewer.contentWindow.postMessage({
					type: "panoramaviewer/destroy"
				})
				galviewer.parentElement.removeChild(galviewer)

				if (galImage) galImage.style.display = galImageDisp
				return
			}

			/* TODO, disabled; no suitable layout found to insert Panoviewet, yet. 
			if (!galImage) {
				// if no item currently selected, check if there is only one gallery-item, 
				//so take this as it is a unique action
				let galitems = gradioApp().querySelectorAll(containerName + " .gallery-item")
				if (1 === galitems.length) {
//					galitems[0].click().then( () => {
//						gradioApp().querySelector(containerName + " ~ div #sendto_panogallery_button").click()
//					})
					galImage = galitems[0].querySelector("img")
					
				}
			}
			*/

			// select only single viewed gallery image, not the small icons in the overview
			if (!galImage) return

			let parent = galImage.parentElement
			//let parent = gradioApp().querySelector(containerName+" > div") // omg

			let iframe = document.createElement('iframe')
			iframe.src = phtml
			iframe.id = "panogalviewer-iframe" + tabContext
			iframe.classList += "panogalviewer-iframe"
			iframe.setAttribute("panoimage", galImage.src)
			iframe.setAttribute("panoMode", mode)
			parent.appendChild(iframe)
			galImageDisp = galImage.style.display
			galImage.style.display = "none"
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

function panorama_change_mode(mode) {
	return () => {
		openpanorama.frame.contentWindow.postMessage({
			type: "panoramaviewer/change-mode",
			mode: mode
		})
	}
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

function setPanoFromDroppedFile(file) {
	reader = new FileReader();
	console.log(file)
	reader.onload = function (event) {
		panoviewer.setPanorama(event.target.result)
	}
	reader.readAsDataURL(file);
}

function dropHandler(ev) {
	// File(s) dropped
	// Prevent default behavior (Prevent file from being opened)
	ev.preventDefault();

	if (ev.dataTransfer.items) {
		// Use DataTransferItemList interface to access the file(s)
		[...ev.dataTransfer.items].forEach((item, i) => {

			// If dropped items aren't files, reject them
			if (item.kind === "file") {
				const file = item.getAsFile();
				console.log(`… file[${i}].name = ${file.name}`);
				if (i === 0) { setPanoFromDroppedFile(file) }

			}
		});
	} else {
		// Use DataTransfer interface to access the file(s)
		[...ev.dataTransfer.files].forEach((file, i) => {
			if (i === 0) { setPanoFromDroppedFile(file) }
			console.log(`… file[${i}].name = ${file.name}`);
		});
	}
}

function dragOverHandler(ev) {
	// Prevent default behavior (Prevent file from being opened)
	ev.preventDefault();
}



function onPanoModeChange(x) {
	console.log("Panorama Viewer: PanMode change to: " + x.target.value)
}


function onGalleryDrop(ev) {

	const triggerGradio = (g, file) => {
		reader = new FileReader();
		reader.onload = function (event) {
			g.value = event.target.result
			g.dispatchEvent(new Event('input'));
		}
		reader.readAsDataURL(file);
	}

	ev.preventDefault();

	let g = gradioApp().querySelector("div[id^='gallery_input_ondrop'] textarea")

	if (ev.dataTransfer.items && g) {
		// Use DataTransferItemList interface to access the file(s)
		[...ev.dataTransfer.items].forEach((item, i) => {

			// If dropped items aren't files, reject them
			if (item.kind === "file") {
				const file = item.getAsFile();
				console.log(`… file[${i}].name = ${file.name}`);
				if (i === 0) { triggerGradio(g, file) }

			}
		});
	} else {
		// Use DataTransfer interface to access the file(s)
		[...ev.dataTransfer.files].forEach((file, i) => {
			if (i === 0) { triggerGradio(file) }
			console.log(`… file[${i}].name = ${file.name}`);
		});
	}

}


document.addEventListener("DOMContentLoaded", () => {
	const onload = () => {
		if (gradioApp) {

			let target = gradioApp().getElementById("txt2img_results")
			if (!target) {
				setTimeout(onload, 5);
				return
			}
			target.addEventListener("drop", onGalleryDrop)
			target.addEventListener("dragover", (event) => {
			event.preventDefault();
			});

			// completely hide the transfer textbox and its container
			let alldrops = gradioApp().querySelectorAll("div[id^='gallery_input_ondrop']")
			alldrops.forEach((e) => { 
				e.parentElement.style.display = "none" 
			})

/* no tab anymore, no functionality
			if (gradioApp().getElementById("panoviewer-iframe")) {
				openpanoramajs();
			} else {
				setTimeout(onload, 10);
			}
*/
		}
		else {
			setTimeout(onload, 3);
		}
	};
	onload();
});





