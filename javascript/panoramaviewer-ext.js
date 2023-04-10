let exports = {}
//import { PNG } from "./pngjs";

const openpanorama = {
	frame: null
};

let galImageDisp

function panorama_here(phtml, mode, buttonId) {
	return async () => {
		try {
			let tabContext = get_uiCurrentTab().innerText
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
				case "Image Browser": {
					tabContext = "IB_" + gradioApp().querySelector("#image_browser_tabs_container button.bg-white").innerText
					switch (tabContext) {
						case "IB_txt2img": containerName = "#image_browser_tab_txt2img_image_browser_gallery"
							break;
						case "IB_img2img": containerName = "#image_browser_tab_img2img_image_browser_gallery"
							break;
						case "IB_txt2img-grids": containerName = "#image_browser_tab_txt2img-grids_image_browser_gallery"
							break;
						case "IB_img2img-grids": containerName = "#image_browser_tab_img2img-grids_image_browser_gallery"
							break;
						case "IB_Extras": containerName = "#image_browser_tab_extras_image_browser_gallery"
							break;
						case "IB_Favorites": containerName = "#image_browser_tab_favorites_image_browser_gallery"
							break;
						default: {
							console.warn("PanoramaViewer: Unsupported Image Browser gallery: " + tabContext)
							return
						}
					}
				}
					break;
				default: {
					console.warn("PanoramaViewer: Unsupported gallery: " + tabContext)
					return
				}
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

			/* close mimics to open a none-iframe */
			if (!phtml) return

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



function panorama_send_video(dataURL, name = "Embed Resource") {
	gradioApp().getElementById("panoviewer-iframe").contentWindow.postMessage({
		type: "panoramaviewer/set-video",
		image: {
			dataURL: dataURL,
			resourceName: name,
		},
	});

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
	let curGal = gradioApp().querySelector('#tabs button.selected').innerText // get_uiCurrentTab()
	if ("Extras" === curGal) curGal = "extras"
	const buttons = gradioApp().querySelectorAll("#" + curGal + "_gallery .grid-container button")
	let button = gradioApp().querySelector("#" + curGal + "_gallery .grid-container button.selected")

	/* pre Gradio 3.23 
	var buttons = gradioApp().querySelectorAll(
		'[style="display: block;"].tabitem div[id$=_gallery] .gallery-item'
	);
	var button = gradioApp().querySelector(
		'[style="display: block;"].tabitem div[id$=_gallery] .gallery-item.\\!ring-2'
	);
	*/

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
		if (panoviewer.adapter.hasOwnProperty("video")) {
			panoviewer.setPanorama({ source: event.target.result })
		} else {
			panoviewer.setPanorama(event.target.result)
		}
	}

	/* comes from upload button */
	if (file.hasOwnProperty("data")) {
		panoviewer.setPanorama({ source: file.data })
	}
	else {
		reader.readAsDataURL(file);
	}
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

		if (!file instanceof Blob) {
			const blob = new Blob([file], { type: file.type });
			file = blob
		}

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
			if (i === 0) { triggerGradio(g, file) }
			console.log(`… file[${i}].name = ${file.name}`);
		});
	}

}


document.addEventListener("DOMContentLoaded", () => {
	const onload = () => {

		if (typeof gradioApp === "function") {

			let target = gradioApp().getElementById("txt2img_results")
			if (!target) {
				setTimeout(onload, 3000);
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

			if (gradioApp().getElementById("panoviewer-iframe")) {
				openpanoramajs();
			} else {
				setTimeout(onload, 3000);
			}

			/* do the toolbox tango */
			gradioApp().querySelectorAll("#PanoramaViewer_ToolBox div ~ div").forEach((e) => {

				const options = {
					attributes: true
				}

				function callback(mutationList, observer) {
					mutationList.forEach(function (mutation) {
						if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
							mutation.target.parentElement.style.flex = target.classList.contains("!hidden") ? "100%" : "auto"
						}
					})
				}

				const observer = new MutationObserver(callback)
				observer.observe(e, options)
			})
		}
		else {
			setTimeout(onload, 3000);
		}
	};
	onload();
});


/* routine based on a c# snippet in stackoverflow */
function convertto_equi() {

	panorama_get_image_from_gallery()
		.then((dataURL) => {

			const canvas = document.createElement('canvas')
			const ctx = canvas.getContext('2d')

			const img = new Image();
			img.src = dataURL

			img.addEventListener('load', () => {
				const { width, height } = img;
				canvas.width = width;
				canvas.height = height;
				ctx.drawImage(img, 0, 0);
				const sourceTexture = ctx.getImageData(0, 0, width, height);

				const outputWidth = sourceTexture.width
				const outputHeight = sourceTexture.height / 1.5

				let equiTexture = new ImageData(outputWidth, outputHeight);
				let u, v; // Normalised texture coordinates, from 0 to 1, starting at lower left corner
				let phi, theta; // Polar coordinates

				const cubeFaceWidth = sourceTexture.width / 4; // 4 horizontal faces
				const cubeFaceHeight = sourceTexture.height / 3; // 3 vertical faces


				onePx = document.createElement("canvas").getContext("2d").createImageData(1, 1);

				for (let j = equiTexture.height-1; j >= 0; j--) {
					// Rows start from the bottom
					v = 1 - (j / equiTexture.height);
					theta = v * Math.PI;

					for (let i = 0; i < equiTexture.width; i++) {

						// Columns start from the left
						u = (i / equiTexture.width);
						phi = u * 2 * Math.PI;

						let x, y, z; // Unit vector
						x = Math.sin(phi) * Math.sin(theta) * -1;
						y = Math.cos(theta);
						z = Math.cos(phi) * Math.sin(theta) * -1;

						let xa, ya, za;
						let a;

						a = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));

						// Vector Parallel to the unit vector that lies on one of the cube faces
						xa = x / a;
						ya = y / a;
						za = z / a;

						let xPixel, yPixel;
						let xOffset, yOffset;

						if (xa == 1) {
							// Right
							xPixel = Math.round(((((za + 1) / 2) - 1) * cubeFaceWidth) - 0.5);
							xOffset = 2 * cubeFaceWidth; // Offset
							yPixel = Math.round((((ya + 1) / 2) * cubeFaceHeight) - 0.5);
							yOffset = cubeFaceHeight; // Offset
						}
						else if (xa == -1) {
							// Left
							xPixel = Math.round(((((za + 1) / 2)) * cubeFaceWidth) - 0.5);
							xOffset = 0;
							yPixel = Math.round((((ya + 1) / 2) * cubeFaceHeight) - 0.5);
							yOffset = cubeFaceHeight;
						}
						else if (ya == 1) {
							// Up
							xPixel = Math.round(((((xa + 1) / 2)) * cubeFaceWidth) - 0.5);
							xOffset = cubeFaceWidth;
							yPixel = Math.round(((((za + 1) / 2) - 1) * cubeFaceHeight) - 0.5);
							yOffset = 2 * cubeFaceHeight;
						}
						else if (ya == -1) {
							// Down
							xPixel = Math.round(((((xa + 1) / 2)) * cubeFaceWidth) - 0, 5);
							xOffset = cubeFaceWidth;
							yPixel = Math.round(((((za + 1) / 2)) * cubeFaceHeight) - 0.5);
							yOffset = 0;
						}
						else if (za == 1) {
							// Front
							xPixel = Math.round(((((xa + 1) / 2)) * cubeFaceWidth) - 0.5);
							xOffset = cubeFaceWidth;
							yPixel = Math.round(((((ya + 1) / 2)) * cubeFaceHeight) - 0.5);
							yOffset = cubeFaceHeight;
						}
						else if (za == -1) {
							//Back
							xPixel = ~~((((xa + 1) / 2) - 1) * cubeFaceWidth);
							xOffset = 3 * cubeFaceWidth;
							yPixel = ~~((((ya + 1) / 2)) * cubeFaceHeight);
							yOffset = cubeFaceHeight;
						}
						else {
							console.warn("Unknown face, something went wrong");
							xPixel = 0;
							yPixel = 0;
							xOffset = 0;
							yOffset = 0;
						}

						xPixel = Math.abs(xPixel);
						yPixel = Math.abs(yPixel);

						xPixel += xOffset;
						yPixel += yOffset;

						const index = 4 * (xPixel + yPixel * sourceTexture.width);
						const tindex = 4 * (i + j * equiTexture.width);
						equiTexture.data[tindex] = sourceTexture.data[index];  // red   color
						equiTexture.data[tindex + 1] = sourceTexture.data[index + 1];  // green color
						equiTexture.data[tindex + 2] = sourceTexture.data[index + 2];  // blue  color
						equiTexture.data[tindex + 3] = sourceTexture.data[index + 3];
					}

				}

				// create canvas and draw equirectangular pixels in it
				const equiCanvas = document.createElement('canvas');
				equiCanvas.width = outputWidth;
				equiCanvas.height = outputHeight;
				const equiCtx = equiCanvas.getContext('2d');

				const equiImageData = equiCtx.createImageData(outputWidth, outputHeight);
				equiImageData.data.set(equiTexture);
				equiCtx.putImageData(equiTexture, 0, 0);

				equiCanvas.toBlob(function (blob) {
					if (blob instanceof Blob) {
						data = { files: [blob] };

						var event = document.createEvent('MouseEvent');
						event.dataTransfer = data;
						onGalleryDrop(event)
					}
					else {
						console.log("no blob from toBlob?!")
					}
				}, 'image/png');
			})
		})
}

/* routine based on jerx/github, gpl3 */
function convertto_cubemap() {

	panorama_get_image_from_gallery()
		.then((dataURL) => {

			const canvas = document.createElement('canvas')
			const ctx = canvas.getContext('2d')

			const outCanvas = document.createElement('canvas')

			const settings = {
				cubeRotation: "180",
				interpolation: "lanczos",
				format: "png"
			};

			const facePositions = {
				pz: { x: 1, y: 1 },
				nz: { x: 3, y: 1 },
				px: { x: 2, y: 1 },
				nx: { x: 0, y: 1 },
				py: { x: 1, y: 0 },
				ny: { x: 1, y: 2 },
			};

			const cubeOrgX = 4
			const cubeOrgY = 3

			function loadImage(dataURL) {

				const img = new Image();
				img.src = dataURL

				img.addEventListener('load', () => {
					const { width, height } = img;
					canvas.width = width;
					canvas.height = height;
					ctx.drawImage(img, 0, 0);
					const data = ctx.getImageData(0, 0, width, height);

					outCanvas.width = width
					outCanvas.height = height*1.5
					processImage(data);
				});
			}

			let finished = 0;
			let workers = [];

			function processImage(data) {
				for (let worker of workers) {
					worker.terminate();
				}
				for (let [faceName, position] of Object.entries(facePositions)) {
					renderFace(data, faceName);
				}
			}

			function renderFace(data, faceName) {
				const options = {
					type: "panorama/",
					data: data,
					face: faceName,
					rotation: Math.PI * settings.cubeRotation / 180,
					interpolation: settings.interpolation,
				};

				let worker
				try {
					throw new Error();
				} catch (error) {
					const stack = error.stack;
					const match = stack.match(/file=.*javascript\//)
					if (match) {
						const scriptPath = window.location.href + match;
						const workerPath = new URL('e2c.js', scriptPath).href;
						worker = new Worker(workerPath);
					}
					else {
						throw "no clue where the javascript worker file is hosted."
					}
				}

				const placeTile = (data) => {
					const ctx = outCanvas.getContext('2d');
					ctx.putImageData(data.data.data,
						facePositions[data.data.faceName].x * outCanvas.width / cubeOrgX,
						facePositions[data.data.faceName].y * outCanvas.height / cubeOrgY)

					finished++;

					if (finished === 6) {
						finished = 0;
						workers = [];

						outCanvas.toBlob(function (blob) {
							if (blob instanceof Blob) {
								data = { files: [blob] };

								var event = document.createEvent('MouseEvent');
								event.dataTransfer = data;
								onGalleryDrop(event)
							}
							else {
								console.log("no blob from toBlob?!")
							}
						}, 'image/png');
					}
				};

				worker.onmessage = placeTile
				worker.postMessage(options)
				workers.push(worker)
			}

			loadImage(dataURL)

		})
}