from modules import script_callbacks, scripts, shared
import os
import html
import gradio as gr
import base64
import io
from PIL import Image
from modules import scripts
from modules.ui_components import ToolButton

usefulDirs = scripts.basedir().split(os.sep)[-2:]
iframesrc = "file="+usefulDirs[0]+"/"+usefulDirs[1]+"/scripts/tab_video.html"
iframesrc_gal = "file="+usefulDirs[0]+"/"+usefulDirs[1]+"/scripts/viewer.html"

# js 2 gradio messaging?! how to do better?
gallery_input_ondrop=None
txt2img_gallery_component=None

def data_url_to_image(data_url):
    comma_position = data_url.find(',')
    base64_data = data_url[comma_position + 1:]
    image_data = base64.b64decode(base64_data)
    image_stream = io.BytesIO(image_data)
    image = Image.open(image_stream)
    return image


def onPanModeChange(m):
     print ("mode changed to"+str(m))

def add_tab():
    with gr.Blocks(analytics_enabled=False) as ui:
        with gr.Column():
#            selectedPanMode = gr.Dropdown(choices=["Equirectangular", "Cubemap: Polyhedron net","Equi Video"],value="Equirectangular",label="Select projection mode", elem_id="panoviewer_mode")
#            selectedPanMode.change(onPanModeChange, inputs=[selectedPanMode],outputs=[], _js="panorama_change_mode")

            upload_button = gr.UploadButton("Upload movie...", file_types=["video"], file_count="single")
            upload_button.upload(fn=None, inputs=upload_button, outputs=None, _js="setPanoFromDroppedFile")
            gr.HTML(value=f"<iframe id=\"panoviewer-iframe\" class=\"border-2 border-gray-200\" src=\"{iframesrc}\" title='description'></iframe>")


    return [(ui, "Panorama Viewer", "panorama-3dviewer")]


def dropHandleGallery(x,g):
        img = data_url_to_image(x)
        if (g is None):
            g = txt2img_gallery_component.value
            
        g.append({'name':"droppedfile", 'data':img, 'is_file':False})
        return txt2img_gallery_component.update(value=[img])
        


def after_component(component, **kwargs):
    global gallery_input_ondrop
    global txt2img_gallery_component
    
    # Add our buttons after each "send to extras" button
    #if kwargs.get("elem_id") == "extras_tab":
    if kwargs.get("elem_id") == "txt2img_send_to_extras" or kwargs.get("elem_id") == "img2img_send_to_extras":

            if (not component.parent.elem_id): return

            if (component.parent.elem_id == "image_buttons_infinite-zoom"):
                #send2tab_panomov_button   = gr.Button ("Pano \U0001F3A6", elem_id=f"sendto_panoramatab_button")          # 🎦
                #send2tab_panomov_button.click(None, [], None, _js="() => panorama_send_infinitezoom('TAB')")
                #send2tab_panomov_button.__setattr__("class","gr-button")

                tabname = kwargs.get("elem_id").replace("_send_to_extras", "")
                #panomoviehere_button   = gr.Button ("Pano \U0001F3A6", elem_id=f"panoramamovie_here_button")          # 🎦
                panomoviehere_button   = ToolButton('🎦', elem_id=f'{tabname}_panoramamovie_here_button', tooltip="Panorama description here.")
                #panomoviehere_button.click(None, [], None, _js="() => panorama_send_infinitezoom('HERE',\""+iframesrc+"\")")
                panomoviehere_button.click(None, [], None, _js="() => panorama_send_infinitezoom('HERE',\""+iframesrc+"\")")

            if (component.parent.elem_id == "image_buttons_txt2img" or component.parent.elem_id == "image_buttons_img2img" or component.parent.elem_id == "image_buttons_extras"):                    
                suffix = component.parent.elem_id
            else:
                return

            with gr.Accordion("Panorama", open=False, elem_id="PanoramaViewer_ToolBox", visible=True):
                    with gr.Row():
                        #view_gallery_button = gr.Button ("\U0001F310", variant="tool", elem_id="sendto_panogallery_button_"+suffix)        # 🌐
                        view_gallery_button   = ToolButton('🌐', elem_id=f'sendto_panogallery_button_'+suffix, tooltip="Panorama Gallery.")
                        #view_cube_button    = gr.Button ("\U0001F9CA", variant="tool",elem_id="sendto_panogallery_cube_button_"+ suffix)   # 🧊
                        view_cube_button   = ToolButton('🧊', elem_id=f'sendto_panogallery_cube_button_'+suffix, tooltip="Panorama Cube.")
                        #view_gallery_button.click (None, [],None, _js="panorama_here(\""+iframesrc_gal+"\",\"\",\""+view_gallery_button.elem_id+"\")" )
                        view_gallery_button.click(None, [],None, _js="panorama_here(\""+iframesrc_gal+"\",\"\",\""+view_gallery_button.elem_id+"\")" )
                        #view_cube_button.click    (None, [],None, _js="panorama_here(\""+iframesrc_gal+"\",\"cubemap\",\""+view_cube_button.elem_id+"\")" )
                        view_cube_button.click(None, [],None, _js="panorama_here(\""+iframesrc_gal+"\",\"cubemap\",\""+view_cube_button.elem_id+"\")" )
                        
                        #conv_cubemap_gallery_button = gr.Button ("\U0000271C", variant="tool", elem_id="convertto_cubemap_button"+suffix)  #✜
                        conv_cubemap_gallery_button   = ToolButton('✜', elem_id=f'convertto_cubemap_button'+suffix, tooltip="Convert to Cubemap.")
                        #conv_cubemap_gallery_button.click (None, [],None, _js="convertto_cubemap" )
                        conv_cubemap_gallery_button.click(None, [],None, _js="convertto_cubemap" )

                        #conv_equi_gallery_button = gr.Button ("\U0001F4AB", variant="tool", elem_id="convertto_equi_button"+suffix)  #💫
                        conv_equi_gallery_button   = ToolButton('💫', elem_id=f'convertto_equi_button'+suffix, tooltip="Convert to Equirectangular.")
                        #conv_equi_gallery_button.click (None, [],None, _js="convertto_equi" )
                        conv_equi_gallery_button.click(None, [],None, _js="convertto_equi" )

                        #close_panoviewer = gr.Button("\U0000274C", variant="tool") # ❌
                        close_panoviewer   = ToolButton('❌')
                        #close_panoviewer.click(None,[],None,_js="panorama_here(\"""\",\"\",\"""\")" )
                        close_panoviewer.click(None,[],None,_js="panorama_here(\"""\",\"\",\"""\")" )

                        gallery_input_ondrop = gr.Textbox(visible=False, elem_id="gallery_input_ondrop_"+ suffix)
                        gallery_input_ondrop.style(container=False)

            if (gallery_input_ondrop and txt2img_gallery_component):
                gallery_input_ondrop.change(fn=dropHandleGallery, inputs=[gallery_input_ondrop], outputs=[txt2img_gallery_component]) 


    if kwargs.get("elem_id") == "txt2img_gallery":
        txt2img_gallery_component = component
        if (gallery_input_ondrop and txt2img_gallery_component):
            gallery_input_ondrop.change(fn=dropHandleGallery, inputs=[gallery_input_ondrop,txt2img_gallery_component], outputs=[txt2img_gallery_component]) 
    

script_callbacks.on_ui_tabs(add_tab)
script_callbacks.on_after_component(after_component)
