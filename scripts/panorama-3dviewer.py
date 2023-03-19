from modules import script_callbacks, scripts, shared
import os
import html
import gradio as gr

usefulDirs = scripts.basedir().split(os.sep)[-2:]
iframesrc = "file="+usefulDirs[0]+"/"+usefulDirs[1]+"/scripts/viewer.html"


def onPanModeChange(m):
     print ("mode changed to"+str(m))


def add_tab():
    with gr.Blocks(analytics_enabled=False) as ui:
        with gr.Column():
            selectedPanMode = gr.Dropdown(choices=["Equirectangular", "Cubemap: Polyhedron net"],value="Equirectangular",label="Select projection mode", elem_id="panoviewer_mode")
            gr.HTML(value=f"<iframe id=\"panoviewer-iframe\" class=\"border-2 border-gray-200\" src=\"{iframesrc}\" title='description'></iframe>")

            selectedPanMode.change(fn=onPanModeChange, inputs=[selectedPanMode],outputs=[], _js="panorama_change_mode(\""+selectedPanMode.value+"\")")

    return [(ui, "Panorama Viewer", "panorama-3dviewer")]


def dropHandleGallery(x):
     print ("on gallery drop handler: " + str(x))
     gal  = filter(lambda obj: obj.elem_id == "txt2img_gallery", shared.demo.blocks)
     print ("elem:" + str(gal))


def after_component(component, **kwargs):
    # Add button to both txt2img and img2img tabs
    if kwargs.get("elem_id") == "extras_tab":
#            with gr.Row(elem_id="pano_sendbox",variant="compact", css="justify-content: center; align-content: flex-end;"):
            send2tab_button   = gr.Button ("Pano \U0001F440", elem_id=f"sendto_panorama_button")          # 👀
            view_gallery_button = gr.Button ("Pano \U0001F310", elem_id="sendto_panogallery_button")        # 🌐
            view_cube_button    = gr.Button ("Pano \U0001F9CA", elem_id="sendto_panogallery_cube_button")   # 🧊
            gallery_input_ondrop = gr.Textbox(visible=True, elem_id="gallery_input_ondrop")

            gallery_input_ondrop.change(fn=dropHandleGallery, inputs=[gallery_input_ondrop], outputs=[])

            send2tab_button.click(None, [], None, _js="() => panorama_send_gallery('WebUI Resource')")
            send2tab_button.__setattr__("class","gr-button")
            view_gallery_button.click (None, [],None, _js="panorama_here(\""+iframesrc+"\")")
            view_cube_button.click    (None, [],None, _js="panorama_here(\""+iframesrc+"\",\"cubemap\")")




script_callbacks.on_ui_tabs(add_tab)
script_callbacks.on_after_component(after_component)
