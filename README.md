An extension for stable-diffusion-webui that integrates panorama views in to SD galleries, that lets you preview 360° spherical images, exactly Equirectangular and Cubemaps (Polyhedron net) ones.  
Since version 0.3 the Tab is removed in favor of two simple button beloe of the gallery.


## Example Result
https://user-images.githubusercontent.com/7210708/224517208-f355a6da-c170-4656-927e-a051fc1d9f40.mp4

## Prompt: 
```"HDRI Panorama View of some nice room..." ```  

Use correct ratio: 
* Equirectangular: 2:1, so like 1024x512
* Polyhedron net (cubemap tiled): 4:3, like 1024x768

Click on Pano-Button once to get the panorama viewer, and click again to close the panorama viewer and switch back to the original gallery view.  

 
![image](https://user-images.githubusercontent.com/7210708/226761659-b0d6ce58-1b04-4f38-b4a7-3363865f9d7d.png)
---
![image](https://user-images.githubusercontent.com/7210708/226762019-29e70005-ebe8-4cb9-811a-37e34a2a4855.png)


![](about.png)

Credits:
Framework used: https://photo-sphere-viewer.js.org/  MIT-License, no liability, no warranty
