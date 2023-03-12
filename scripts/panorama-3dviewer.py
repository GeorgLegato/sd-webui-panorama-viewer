from modules import script_callbacks, scripts, shared
import os
import html
from modules import script_callbacks, shared
import gradio as gr

usefulDirs = scripts.basedir().split(os.sep)[-2:]
iframesrc = "file="+usefulDirs[0]+"/"+usefulDirs[1]+"/scripts/viewer.html"

def add_tab():
    with gr.Blocks(analytics_enabled=False) as ui:
        gr.HTML(value=f"<iframe id=\"panoviewer-iframe\" class=\"border-2 border-gray-200\" src=\"{iframesrc}\" title='description'></iframe>")
    return [(ui, "Panorama Viewer", "panorama-3dviewer")]

def after_component(component, **kwargs):
    # Add button to both txt2img and img2img tabs
    if kwargs.get("elem_id") == "extras_tab":
#            with gr.Row(elem_id="pano_sendbox",variant="compact", css="justify-content: center; align-content: flex-end;"):
            basic_send_button = gr.Button("Pano \U0001F440", elem_id=f"sendto_panorama_button") # 👀
            view_gallery_button = gr.Button ("Pano \U0001F310") # 🌐

            basic_send_button.click(None, [], None, _js="() => panorama_send_gallery('WebUI Resource')")
            basic_send_button.__setattr__("class","gr-button")
            view_gallery_button.click (None, [],None, _js="panorama_here(\""+iframesrc+"\")")

script_callbacks.on_ui_tabs(add_tab)
script_callbacks.on_after_component(after_component)
