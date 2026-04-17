# images-to-webp-cli

CLI tool to convert images to WebP format.


## Installation

```bash
npm install -g images-to-webp-cli
```

## Usage

Convert a single image:
```bash
images-to-webp-cli convert /path/to/image.jpg
```

Convert with custom quality:
```bash
images-to-webp-cli convert /path/to/image.png -q 90
```

Convert all images in a directory:
```bash
images-to-webp-cli convert /path/to/directory
```

## Options

- `-q, --quality <number>` - WebP quality (1-100), default: 80

## Supported Formats

- PNG
- JPG/JPEG

## Using with npx

```bash
npx images-to-webp-cli convert path/to/image.jpg
```