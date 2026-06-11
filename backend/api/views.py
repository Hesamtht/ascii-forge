from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import status

from .converters import available_fonts, text_to_ascii, image_to_ascii

MAX_TEXT_LENGTH = 200
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB


@api_view(["GET"])
def fonts(request):
    return Response({"fonts": available_fonts()})


@api_view(["POST"])
def text_art(request):
    text = request.data.get("text", "").strip()
    font = request.data.get("font", "standard")

    if not text:
        return Response(
            {"error": "Field 'text' is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if len(text) > MAX_TEXT_LENGTH:
        return Response(
            {"error": f"Text must be {MAX_TEXT_LENGTH} characters or fewer."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        result = text_to_ascii(text, font=font)
    except ValueError as exc:
        return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        return Response(
            {"error": "Could not render text with the selected font."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response({"ascii": result})


@api_view(["POST"])
@parser_classes([MultiPartParser])
def image_art(request):
    image = request.FILES.get("image")
    if image is None:
        return Response(
            {"error": "Multipart field 'image' is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if image.size > MAX_IMAGE_SIZE:
        return Response(
            {"error": "Image must be 5 MB or smaller."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    width = request.data.get("width", 100)
    charset = request.data.get("charset", "standard")
    invert = str(request.data.get("invert", "false")).lower() == "true"

    try:
        width = int(width)
    except (TypeError, ValueError):
        return Response(
            {"error": "Field 'width' must be an integer."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        result = image_to_ascii(image, width=width, charset=charset, invert=invert)
    except Exception:
        return Response(
            {"error": "Could not read the uploaded file as an image."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response({"ascii": result})
