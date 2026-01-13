#!/bin/bash

# Build script for DOOM WebXDC package
# Creates doom.xdc with all game files

cd "$(dirname "$0")"

# Remove old package if exists
rm -f doom.xdc

# Create a temporary build directory
BUILD_DIR=$(mktemp -d)
trap "rm -rf $BUILD_DIR" EXIT

# Copy required files to build directory
cp index.html "$BUILD_DIR/"
cp main.js "$BUILD_DIR/"
cp doom.js "$BUILD_DIR/"
cp doom.wasm "$BUILD_DIR/"
cp doom.wad "$BUILD_DIR/"
cp manifest.toml "$BUILD_DIR/"
cp icon.png "$BUILD_DIR/"

# Copy music directory
cp -r music "$BUILD_DIR/"

# Minify JavaScript (skip doom.js - it's already minified from Emscripten)
if command -v npx &> /dev/null; then
  if [ -f "$BUILD_DIR/main.js" ]; then
    npx terser "$BUILD_DIR/main.js" \
      --compress \
      --mangle \
      --output "$BUILD_DIR/main.js" 2>/dev/null || true
  fi
fi

# Minify HTML file
if [ -f "$BUILD_DIR/index.html" ]; then
  perl -0777 -pe '
    # Remove HTML comments (but keep conditional comments)
    s/<!--(?!\[).*?-->//gs;
    # Remove leading/trailing whitespace from lines
    s/^\s+//gm;
    s/\s+$//gm;
    # Remove empty lines
    s/\n\s*\n/\n/g;
  ' "$BUILD_DIR/index.html" > "$BUILD_DIR/index.html.min" && mv "$BUILD_DIR/index.html.min" "$BUILD_DIR/index.html"
fi

# Create zip with maximum compression (-9)
cd "$BUILD_DIR"
zip -9 -r "$OLDPWD/doom.xdc" . \
  -x "*.DS_Store"

# Show final size
cd "$OLDPWD"
echo ""
echo "Built doom.xdc"
ls -lh doom.xdc
echo ""
echo "Contents:"
unzip -l doom.xdc | tail -n +4 | head -n -2
