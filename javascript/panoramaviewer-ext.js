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
	const curGal = gradioApp().querySelector('#tabs button.selected').innerText // get_uiCurrentTab()

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
				const outputHeight = sourceTexture.height /1.5

				let equiTexture = new ImageData(outputWidth, outputHeight);
				let u, v; // Normalised texture coordinates, from 0 to 1, starting at lower left corner
				let phi, theta; // Polar coordinates

				const cubeFaceWidth = sourceTexture.width / 4; // 4 horizontal faces
				const cubeFaceHeight = sourceTexture.height / 3; // 3 vertical faces


				onePx = document.createElement("canvas").getContext("2d").createImageData(1, 1);
				
				for (let j = 0; j < equiTexture.height; j++) {
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
						equiTexture.data[tindex] = sourceTexture.data[index    ];  // red   color
						equiTexture.data[tindex+1] = sourceTexture.data[index + 1];  // green color
						equiTexture.data[tindex+2] = sourceTexture.data[index + 2];  // blue  color
						equiTexture.data[tindex+3] = sourceTexture.data[index + 3];
					}

				}

				// create canvas and draw equirectangular pixels in it
				const equiCanvas = document.createElement('canvas');
				equiCanvas.width = outputWidth;
				equiCanvas.height = outputHeight;
				const equiCtx = equiCanvas.getContext('2d');

				const equiImageData = equiCtx.createImageData(outputWidth, outputHeight);
				equiImageData.data.set(equiTexture);
				equiCtx.putImageData(equiImageData, 0, 0);

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
/* routine based on disseminate/cube2equi github.com, default Github license 
function convertto_equi__() {
	// W, H are output size width
	let W, H
	const EquiCoordToPolar = (x, y) => {
		const xNorm = (2 * x / W) - 1;
		const yNorm = 1 - (2 * y / H);

		const theta = xNorm * Math.PI;
		const phi = Math.asin(yNorm);

		return [theta, phi];
	};

	const PolarToUnitVector = (theta, phi) => {
		const x = Math.cos(phi) * Math.cos(theta);
		const y = Math.sin(phi);
		const z = Math.cos(phi) * Math.sin(theta);

		return [x, y, z];
	};

	const DotProduct = (a, b) => {
		return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	};

	const Normalize = (a) => {
		const len = Math.sqrt(DotProduct(a, a));
		return [a[0] / len, a[1] / len, a[2] / len];
	};

	const Mul = (a, scalar) => {
		return [a[0] * scalar, a[1] * scalar, a[2] * scalar];
	};

	SIDE_BACK = 1;
	SIDE_LEFT = 5;
	SIDE_FRONT = 0;
	SIDE_RIGHT = 4;
	SIDE_TOP = 2;
	SIDE_BOTTOM = 3;

	const IntersectRayWithPlane = (side, normal, p0, ray) => {
		const denom = DotProduct(normal, ray);
		if (Math.abs(denom) > 0.0000001) {
			const t = DotProduct(p0, normal) / denom;

			if (t >= 0) {
				const newVec = Mul(ray, t);
				if (side === SIDE_LEFT) {
					if (newVec[0] >= -1 && newVec[0] <= 1 && newVec[1] >= -1 && newVec[1] <= 1) {
						return [(newVec[0] + 1) / 2, (newVec[1] + 1) / 2];
					}
				} else if (side === SIDE_RIGHT) {
					if (newVec[0] >= -1 && newVec[0] <= 1 && newVec[1] >= -1 && newVec[1] <= 1) {
						return [1 - (newVec[0] + 1) / 2, (newVec[1] + 1) / 2];
					}
				} else if (side === SIDE_FRONT) {
					if (newVec[1] >= -1 && newVec[1] <= 1 && newVec[2] >= -1 && newVec[2] <= 1) {
						return [(newVec[2] + 1) / 2, (newVec[1] + 1) / 2];
					}
				} else if (side === SIDE_BACK) {
					if (newVec[1] >= -1 && newVec[1] <= 1 && newVec[2] >= -1 && newVec[2] <= 1) {
						return [1 - (newVec[2] + 1) / 2, 1 - (newVec[1] + 1) / 2];
					}
				} else if (side === SIDE_TOP) {
					if (newVec[0] >= -1 && newVec[0] <= 1 && newVec[2] >= -1 && newVec[2] <= 1) {
						return [1 - (newVec[0] + 1) / 2, 1 - (newVec[2] + 1) / 2];
					}
				} else if (side === SIDE_BOTTOM) {
					if (newVec[0] >= -1 && newVec[0] <= 1 && newVec[2] >= -1 && newVec[2] <= 1) {
						return [(newVec[0] + 1) / 2, (newVec[2] + 1) / 2];
					}
				}
			}
		}
	};

	const MV = (vec) => {
		return [-vec[0], -vec[1], -vec[2]];
	};

	const IntersectRayWithBoxes = (ray) => {
		let t;

		const boxes = [
			[1, 0, 0],
			[-1, 0, 0],
			[0, 1, 0],
			[0, -1, 0],
			[0, 0, 1],
			[0, 0, -1],
		];

		for (let i = 0; i < boxes.length; i++) {
			xy = IntersectRayWithPlane(i, MV(boxes[i]), boxes[i], Normalize(ray));
			if (xy !== undefined) {
				return [i, xy[0], xy[1]];
			}
		}
	};

	const SideXYToCubemap = (side, x, y) => {
		let newY, newX;
		switch (side) {
			case SIDE_BACK:
				newY = (1 / 3) + y * (1 / 3);
				return [x * 0.25, newY];
			case SIDE_LEFT:
				newY = (2 / 3) - y * (1 / 3);
				return [0.25 + x * 0.25, newY];
			case SIDE_FRONT:
				newY = (2 / 3) - y * (1 / 3);
				return [0.5 + x * 0.25, newY];
			case SIDE_RIGHT:
				newY = (2 / 3) - y * (1 / 3);
				return [0.75 + x * 0.25, newY];
			case SIDE_TOP:
				newY = y * (1 / 3);
				newX = 0.5 - x * 0.25;
				return [newX, newY];
			case SIDE_BOTTOM:
				newY = (2 / 3) + y * (1 / 3);
				newX = 0.25 + x * 0.25;
				return [newX, newY];
		}
	};

	function doIt() {
		W = png.width;
		H = W / 2;

		const outPNG = new PNG({
			width: W,
			height: H,
			colorType: 2,
			inputHasAlpha: false
		});

		for (let j = 0; j < H; j++) {
			for (let i = 0; i < W; i++) {
				const angs = EquiCoordToPolar(i, j);
				const ray = PolarToUnitVector(angs[0], angs[1]);
				const sxc = IntersectRayWithBoxes(ray);
				const xy = SideXYToCubemap(sxc[0], sxc[1], sxc[2]);

				const sampleX = Math.floor(xy[0] * png.width);
				const sampleY = Math.floor(xy[1] * png.height);

				const idx = (png.width * sampleY + sampleX) << 2;
				const oidx = (W * j + i) * 3;

				outPNG.data[oidx] = png.data[idx];
				outPNG.data[oidx + 1] = png.data[idx + 1];
				outPNG.data[oidx + 2] = png.data[idx + 2];
			}
		}

		const outBuffer = PNG.sync.write(outPNG);
		const blob = new Blob([outBuffer], { type: 'image/png' });

		//const dataTransfer = new DataTransfer();
		//dataTransfer.items.add(new File([blob], 'equi.png', { type: 'image/png' }));
		// Transfer the image data to another element
		//const targetElement = document.getElementById('target');
		//targetElement.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dataTransfer }));
		if (blob instanceof Blob) {
			data = { files: [blob] };
			var event = document.createEvent('MouseEvent');
			event.dataTransfer = data;
			onGalleryDrop(event);
		}
		else {
			console.log("no blob from toBlob?!");
		}
	}

	function handlePNGParsed(error, png) {
		if (error) {
			console.error('Failed to parse PNG:', error);
			return;
		}
		doIt(png)
	}

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
				const data = ctx.getImageData(0, 0, width, height);

				const png = new PNG({
					width: canvas.width,
					height: canvas.height
				});

				// Copy the pixel data from the ImageData object to the PNG object
				png.data.set(imageData.data);
				doIt(png);
			});
		})
}
*/

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
					outCanvas.height = (width / cubeOrgX) * cubeOrgY
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