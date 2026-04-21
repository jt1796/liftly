#!/bin/bash

# Define colors
PLATE_COLOR="#2b2b2b"
RIM_COLOR="#3d3d3d"
HUB_COLOR="#4a4a4a"
TEXT_COLOR="#ffffff"

# Base Icon (1024x1024)
magick -size 1024x1024 xc:transparent \
    -fill "$PLATE_COLOR" -draw "circle 512,512 512,20" \
    -fill "$RIM_COLOR" -draw "circle 512,512 512,60" \
    -fill "$PLATE_COLOR" -draw "circle 512,512 512,100" \
    -fill "$HUB_COLOR" -draw "circle 512,512 512,400" \
    -fill "$PLATE_COLOR" -draw "circle 512,512 512,460" \
    -fill "$TEXT_COLOR" -font "Helvetica-Bold" -pointsize 140 -gravity center -annotate +0-220 "LIFTLY" \
    -fill "$TEXT_COLOR" -font "Helvetica-Bold" -pointsize 100 -gravity center -annotate +0+250 "45 LB" \
    -fill "#1a1a1a" -draw "circle 512,512 512,485" \
    assets/images/icon.png

# Adaptive Icon Foreground (centered plate)
magick assets/images/icon.png -resize 800x800 -background transparent -gravity center -extent 1024x1024 assets/images/android-icon-foreground.png

# Adaptive Icon Background (just a solid color as per app.json)
magick -size 1024x1024 xc:"#E6F4FE" assets/images/android-icon-background.png

# Monochrome Icon (for Android)
magick assets/images/icon.png -colorspace gray assets/images/android-icon-monochrome.png

# Favicon
magick assets/images/icon.png -resize 48x48 assets/images/favicon.png

# Splash Icon
magick assets/images/icon.png -resize 512x512 assets/images/splash-icon.png

# App Logos (replacing react-logo)
cp assets/images/icon.png assets/images/react-logo.png
cp assets/images/icon.png assets/images/react-logo@2x.png
cp assets/images/icon.png assets/images/react-logo@3x.png

echo "Icons generated successfully!"
