# SeoToolKit

A comprehensive, all-in-one tool for optimizing websites for search engines and improving performance.

GitHub Repository: [https://github.com/Aethery0y/SeoToolKit](https://github.com/Aethery0y/SeoToolKit)

## Overview

SeoToolKit is a single-file Node.js tool designed to improve website SEO and performance through various optimization techniques. It provides a user-friendly interactive interface to enhance website speed, search engine visibility, and overall user experience.

## Features

### Image Optimization
- **Convert Images to WebP**: Automatically convert PNG, JPG, and GIF images to the WebP format, reducing file size by up to 80%
- **Image Resizing**: Resize large images to more appropriate dimensions
- **Replace References**: Automatically update HTML, CSS, and JS references to point to the new WebP images
- **Backup Original Images**: Original images are safely stored in a "replaced" folder

### Code Optimization
- **CSS Minification**: Reduce CSS file sizes while preserving functionality
- **HTML Minification**: Compress HTML files for faster loading
- **JavaScript Minification**: Optimize JavaScript files for better performance
- **Code Beautification**: Format code for better readability during development

### SEO Enhancements
- **Lazy Loading**: Add loading="lazy" attribute to images for better performance
- **Alt Attributes**: Add descriptive alt attributes to images for accessibility
- **Sitemap Generation**: Create sitemap.xml files for better search engine crawling
- **Robots.txt Creation**: Generate robots.txt files with custom rules
- **Schema Markup Generation**: Add JSON-LD structured data to HTML files for rich search results

## Installation

The toolkit is a standalone file that requires Node.js to run. No manual installation of dependencies is needed as the tool automatically installs required packages on first run.

### Option 1: Direct Download from GitHub

You can download the toolkit directly using curl or wget:

```bash
# Using curl
curl -o SeoToolKit.js https://raw.githubusercontent.com/Aethery0y/SeoToolKit/main/SeoToolKit.js

# Using wget
wget https://raw.githubusercontent.com/Aethery0y/SeoToolKit/main/SeoToolKit.js

# Make it executable (optional, for Unix systems)
chmod +x SeoToolKit.js
```

### Option 2: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Aethery0y/SeoToolKit.git

# Navigate to the directory
cd SeoToolKit

# Make it executable (optional, for Unix systems)
chmod +x SeoToolKit.js
```

### Running the Tool

```bash
# Run the toolkit
node SeoToolKit.js
```

## Usage

### Basic Usage

```bash
# Run in the current directory
node SeoToolKit.js

# Run in a specific directory
node SeoToolKit.js -d /path/to/website
```

### Command Line Options

- `-d, --directory DIR`: Specify target directory (default: current directory)
- `-h, --help`: Display help information

## Schema Markup Generation

The Schema Markup Generator automatically adds JSON-LD structured data to your HTML files for better search engine understanding and rich search results. The tool intelligently analyzes page content to determine the appropriate schema type:

- **Website Schema**: Basic schema for all web pages
- **Blog Post Schema**: Enhanced schema for blog content with author, date, and image information
- **Product Schema**: Detailed product schema with pricing information
- **Organization Schema**: Business information schema with contact points and social profiles

The generated schema is added directly to the `<head>` section of your HTML files.

## Performance Analysis

After each operation, the toolkit provides detailed statistics on:

- Number of files processed
- Total file size before and after optimization
- Size reduction percentage
- Success and error counts

## Example Statistics

```
╭────────────────────────────────────────────────────────────────────╮
│                                                                    │
│                      📊 OPTIMIZATION SUMMARY 📊                    │
│                                                                    │
╰────────────────────────────────────────────────────────────────────╯

  ✨ 🖼️  IMAGES
     ╭─────────────────────────────────────────────────────────╮
     │  📊 Converted: 24       │  ❌ Failed: 0        │
     │  📥 Before: 5.34 MB     │  📤 After: 1.27 MB   │
     │  💾 Saved: 4.07 MB      │  📉 Reduction: 76.21%  │
     ╰─────────────────────────────────────────────────────────╯
```

## Technical Requirements

- Node.js 14 or higher
- The following npm packages (auto-installed by the toolkit):
  - fs-extra
  - sharp
  - clean-css
  - js-beautify
  - inquirer
  - html-minifier
  - terser

## Function Reference

The SeoToolKit includes these key functions:

- `convertImagesRecursively`: Converts images to WebP format
- `replaceImageExtensionsRecursively`: Updates references to converted images
- `processCssFiles`: Minifies or beautifies CSS files
- `processHtmlFiles`: Minifies or beautifies HTML files
- `processJsFiles`: Minifies or beautifies JavaScript files
- `addLazyLoadingToImages`: Adds lazy loading to images in HTML files
- `addAltAttributesToImages`: Adds alt attributes to images
- `generateSitemap`: Creates a sitemap.xml file
- `generateRobotsTxt`: Creates a robots.txt file
- `generateSchemaMarkup`: Adds JSON-LD schema data to HTML files

## License

This tool is provided as open-source software.