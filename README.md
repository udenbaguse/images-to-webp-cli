# image-to-webp

CLI tool to convert images to WebP format.


## Installation

```bash
npm install -g image-to-webp
```

## Usage

Convert a single image:
```bash
image-to-webp convert /path/to/image.jpg
```

Convert with custom quality:
```bash
image-to-webp convert /path/to/image.png -q 90
```

Convert all images in a directory:
```bash
image-to-webp convert /path/to/directory
```

## Options

- `-q, --quality <number>` - WebP quality (1-100), default: 80

## Supported Formats

- PNG
- JPG/JPEG

## Using with npx

```bash
npx image-to-webp convert path/to/image.jpg
```