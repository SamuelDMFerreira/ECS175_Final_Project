# Exports each selected object into its own file

import bpy
import os

# export to blend file location
basedir = os.path.dirname(bpy.data.filepath)

if not basedir:
    raise Exception("Blend file is not saved")

view_layer = bpy.context.view_layer

obj_active = view_layer.objects.active

# Get the desired / selected objects to export
selection = bpy.context.selected_objects

# Deselect all objects in the scene (This is to get around Blender exporting all objects, even non-selected ones)
bpy.ops.object.select_all(action='DESELECT')

# We want to only export the objects that are selected so now we re-select them
for obj in selection:

    obj.select_set(True)

    # Set the selected objects as the ones we want to export
    view_layer.objects.active = obj

    name = bpy.path.clean_name(obj.name)
    fn = os.path.join(basedir, name)

    # File type being exported is .obj
    bpy.ops.wm.obj_export(filepath=fn + ".obj", export_selected_objects=True)

    obj.select_set(False)

    # Console cmd just to print where exported obj is located
    print("written:", fn)


view_layer.objects.active = obj_active

for obj in selection:
    obj.select_set(True)