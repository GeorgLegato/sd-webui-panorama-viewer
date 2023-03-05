from modules import script_callbacks, scripts, shared
import os
import html
from modules import script_callbacks, shared
import gradio as gr

usefulDirs = scripts.basedir().split(os.sep)[-2:]

def add_tab():
    with gr.Blocks(analytics_enabled=False) as ui:
        gr.HTML(value=f"<iframe id=\"panoviewer-iframe\" class=\"border-2 border-gray-200\" src=\"file={usefulDirs[0]}/{usefulDirs[1]}/scripts/viewer.html\" title='description'></iframe>")
    return [(ui, "Panorama-3D-Viewer", "panorama-3dviewer")]

def after_component(component, **kwargs):
    # Add button to both txt2img and img2img tabs
    if kwargs.get("elem_id") == "extras_tab":
        basic_send_button = gr.Button("Send to PanoramaViewer", elem_id=f"sendto_panorama_button")
        basic_send_button.click(None, [], None, _js="() => panorama_send_gallery('WebUI Resource')")

script_callbacks.on_ui_tabs(add_tab)
script_callbacks.on_after_component(after_component)
