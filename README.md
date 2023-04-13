An extension for stable-diffusion-webui that integrates panorama views in to SD galleries, that lets you preview 360° spherical images, exactly Equirectangular and Cubemaps (Polyhedron net) ones.  
Since version 0.3 the Tab is removed in favor of two simple button beloe of the gallery.


## Example Result
https://user-images.githubusercontent.com/7210708/224517208-f355a6da-c170-4656-927e-a051fc1d9f40.mp4

## Prompt: 
```"HDRI Panorama View of some nice room..." ```  

Use correct ratio: 
* Equirectangular: 2:1, so like 1024x512 (less is also ok, more coherence on 768x512)
* Polyhedron net (cubemap tiled): 4:3, like 1024x768

Click on Pano-Button once to get the panorama viewer, and click again to close the panorama viewer and switch back to the original gallery view.  

 
![image](https://user-images.githubusercontent.com/7210708/231022031-c6637928-5669-43c2-999a-45c0de6019ae.png)
---
![image](https://user-images.githubusercontent.com/7210708/231022147-b216df9a-8cc4-416c-b23c-ae7977db1bc8.png)

## Convert into Cubemap inside the gallery
And send to openOutpaint for finishing
![image](https://user-images.githubusercontent.com/7210708/231022288-2768f098-a3b7-4371-9317-5c3556f7cf77.png)


![](about.png)

Credits:
Framework used: https://photo-sphere-viewer.js.org/  MIT-License, no liability, no warranty
