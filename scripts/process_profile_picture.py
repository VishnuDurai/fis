#!/usr/bin/env python3
"""
Profile Picture Background Standardization Processor
Automatically isolates portraits and changes the image background to solid pure white (#FFFFFF).

Usage:
    python3 scripts/process_profile_picture.py <input_image_path> [output_image_path] [bg_color_hex]
"""

import sys
import os
import json
from PIL import Image, ImageOps

def hex_to_rgb(hex_str):
    hex_clean = hex_str.lstrip('#')
    if len(hex_clean) == 3:
        hex_clean = ''.join([c*2 for c in hex_clean])
    if len(hex_clean) != 6:
        return (255, 255, 255)
    return tuple(int(hex_clean[i:i+2], 16) for i in (0, 2, 4))

def process_image(input_path, output_path=None, bg_color_hex="#ffffff"):
    if not output_path:
        output_path = input_path

    if not os.path.exists(input_path):
        return {
            "success": False,
            "error": f"Input image not found: {input_path}"
        }

    bg_rgb = hex_to_rgb(bg_color_hex)
    bg_rgba = (bg_rgb[0], bg_rgb[1], bg_rgb[2], 255)

    try:
        # 1. Open with Pillow and fix EXIF rotation
        raw_img = Image.open(input_path)
        img = ImageOps.exif_transpose(raw_img)
        if img is None:
            img = raw_img

        processed = False
        result_img = None

        # 2. Attempt AI portrait background removal via rembg
        try:
            import rembg
            # Use u2net_human_seg for fast, accurate human portrait segmentation
            try:
                session = rembg.new_session('u2net_human_seg')
            except Exception:
                try:
                    session = rembg.new_session('u2netp')
                except Exception:
                    session = None

            if session:
                rgba_output = rembg.remove(img, session=session, bgcolor=bg_rgba)
            else:
                rgba_output = rembg.remove(img, bgcolor=bg_rgba)

            # Ensure proper compositing onto white canvas
            if rgba_output.mode == 'RGBA':
                white_canvas = Image.new('RGB', rgba_output.size, bg_rgb)
                white_canvas.paste(rgba_output, (0, 0), rgba_output.split()[3])
                result_img = white_canvas
            else:
                result_img = rgba_output.convert('RGB')
            
            processed = True
        except Exception as rembg_err:
            # rembg fallback
            pass

        # 3. Fallback: If rembg was not available or failed, handle transparency / Pillow conversion
        if not processed or result_img is None:
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                rgba = img.convert('RGBA')
                white_canvas = Image.new('RGB', rgba.size, bg_rgb)
                white_canvas.paste(rgba, (0, 0), rgba.split()[3])
                result_img = white_canvas
            else:
                result_img = img.convert('RGB')

        # 4. Save the result
        # Determine output format from extension
        ext = os.path.splitext(output_path)[1].lower()
        if ext in ('.jpg', '.jpeg'):
            result_img.save(output_path, 'JPEG', quality=95, optimize=True)
        elif ext == '.png':
            result_img.save(output_path, 'PNG', optimize=True)
        elif ext == '.webp':
            result_img.save(output_path, 'WEBP', quality=95)
        else:
            # Default to JPEG
            result_img.save(output_path, 'JPEG', quality=95, optimize=True)

        return {
            "success": True,
            "path": output_path,
            "width": result_img.width,
            "height": result_img.height,
            "processed": processed
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Usage: process_profile_picture.py <input_path> [output_path] [bg_color_hex]"}))
        sys.exit(1)

    inp = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else inp
    bg = sys.argv[3] if len(sys.argv) > 3 else "#ffffff"

    res = process_image(inp, out, bg)
    print(json.dumps(res))
    if not res.get("success"):
        sys.exit(1)
