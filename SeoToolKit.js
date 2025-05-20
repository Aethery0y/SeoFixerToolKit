#!/usr/bin/env node

/**
 * SeoToolKit
 * A comprehensive tool for optimizing websites for SEO and performance
 *
 * Features:
 * - Image conversion to WebP
 * - Image resizing and optimization
 * - CSS minification
 * - HTML minification
 * - JavaScript minification
 * - Lazy loading addition
 * - JSON-LD schema generation
 * - Code beautification
 * - Sitemap & robots.txt generation
 * - Detailed statistics tracking
 * - Auto-dependency installation
 */

// Check and install required dependencies before loading them
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Define required packages
const requiredPackages = [
  "fs-extra",
  "sharp",
  "clean-css",
  "js-beautify",
  "inquirer",
  "html-minifier",
  "terser",
];

// Function to check if a package is installed
function isPackageInstalled(packageName) {
  try {
    require.resolve(packageName);
    return true;
  } catch (e) {
    return false;
  }
}

// Install missing packages
let missingPackages = [];
for (const pkg of requiredPackages) {
  if (!isPackageInstalled(pkg)) {
    missingPackages.push(pkg);
  }
}

if (missingPackages.length > 0) {
  console.log(
    `🔍 Missing dependencies detected: ${missingPackages.join(", ")}`,
  );
  console.log("📦 Installing required packages...");

  try {
    execSync(`npm install ${missingPackages.join(" ")}`, { stdio: "inherit" });
    console.log("✅ Dependencies installed successfully!");
  } catch (error) {
    console.error(
      "❌ Failed to install dependencies. Please install them manually:",
    );
    console.error(`npm install ${missingPackages.join(" ")}`);
    process.exit(1);
  }
}

// Now load all the dependencies
const fsExtra = require("fs-extra");
const sharp = require("sharp");
const CleanCSS = require("clean-css");
const beautify = require("js-beautify");
const inquirer = require("inquirer").default || require("inquirer");
const htmlMinifier = require("html-minifier");
const { minify: minifyJS } = require("terser");

// Process command-line arguments
const args = process.argv.slice(2);
let targetDir = process.cwd();
let showHelp = false;

// Parse arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === "-d" || args[i] === "--directory") {
    if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
      targetDir = args[i + 1];
      i++; // Skip the next argument as we've used it
    } else {
      console.error("Error: Directory argument is missing");
      showHelp = true;
      break;
    }
  } else if (args[i] === "-h" || args[i] === "--help") {
    showHelp = true;
    break;
  } else {
    console.error(`Unknown option: ${args[i]}`);
    showHelp = true;
    break;
  }
}

// Display help and exit if requested
if (showHelp) {
  console.log("Ultimate SEO & Performance Toolkit");
  console.log("Usage: node seo-optimizer.js [options]");
  console.log("\nOptions:");
  console.log(
    "  -d, --directory DIR   Specify target directory (default: current directory)",
  );
  console.log("  -h, --help            Show this help message");
  console.log("\nExamples:");
  console.log(
    "  node seo-optimizer.js                   Run on current directory",
  );
  console.log(
    "  node seo-optimizer.js -d /path/to/site  Run on specified directory",
  );
  console.log("\nFeatures:");
  console.log("  • Automatically installs required dependencies");
  console.log(
    "  • Converts images to WebP format (saves up to 80% in file size)",
  );
  console.log("  • Minifies CSS, HTML, and JavaScript files");
  console.log("  • Adds lazy loading to images");
  console.log("  • Provides detailed statistics on size savings");
  process.exit(0);
}

// Check if the target directory exists
if (!fsExtra.existsSync(targetDir)) {
  console.error(`Error: Directory ${targetDir} does not exist`);
  process.exit(1);
}

// Change to the target directory
process.chdir(targetDir);
console.log(`🚀 Running SEO Toolkit on: ${targetDir}`);

// File extensions
const imgExtensions = [".png", ".jpg", ".jpeg", ".gif"];
const convertExtensions = [".jpg", ".jpeg", ".png", ".gif"];
const textFileExtensions = [
  ".html",
  ".htm",
  ".css",
  ".js",
  ".ts",
  ".json",
  ".php",
  ".ejs",
  ".vue",
  ".md",
  ".txt",
];

const scriptFileName = path.basename(process.argv[1]);

// Statistics tracking
const stats = {
  images: {
    converted: 0,
    failed: 0,
    totalSizeBefore: 0,
    totalSizeAfter: 0,
  },
  css: {
    processed: 0,
    failed: 0,
    totalSizeBefore: 0,
    totalSizeAfter: 0,
  },
  html: {
    processed: 0,
    failed: 0,
    totalSizeBefore: 0,
    totalSizeAfter: 0,
  },
  js: {
    processed: 0,
    failed: 0,
    totalSizeBefore: 0,
    totalSizeAfter: 0,
  },
  altAttributes: {
    added: 0,
    failed: 0,
  },
  sitemap: {
    added: 0,
    urls: 0,
  },
  robots: {
    created: false,
  },
  schema: {
    added: 0,
    failed: 0,
  },
};

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
  );
}

function calculateSavings(before, after) {
  const saved = before - after;
  const percentage = before > 0 ? (saved / before) * 100 : 0;
  return {
    bytes: saved,
    percentage: percentage.toFixed(2) + "%",
    formattedSaved: formatBytes(saved),
  };
}

function shouldSkip(filePath) {
  return (
    filePath.split(path.sep).includes("replaced") ||
    filePath.split(path.sep).includes("node_modules") ||
    path.basename(filePath) === scriptFileName
  );
}

function isTextFile(fileName) {
  return textFileExtensions.includes(path.extname(fileName).toLowerCase());
}

async function convertImagesRecursively(folder, options) {
  try {
    const entries = await fsExtra.readdir(folder, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(folder, entry.name);

      if (shouldSkip(entryPath)) continue;

      if (entry.isDirectory()) {
        await convertImagesRecursively(entryPath, options);
      } else {
        const ext = path.extname(entry.name).toLowerCase();

        if (convertExtensions.includes(ext)) {
          const webpFilename = path.basename(entry.name, ext) + ".webp";
          const webpPath = path.join(folder, webpFilename);
          const replacedFolder = path.join(folder, "replaced");
          await fsExtra.ensureDir(replacedFolder);

          try {
            // Get file size before conversion
            const fileStat = await fsExtra.stat(entryPath);
            stats.images.totalSizeBefore += fileStat.size;

            // Process the image
            const sharpInstance = sharp(entryPath);

            // Resize image if option is enabled
            if (options.resize) {
              const metadata = await sharpInstance.metadata();
              if (metadata.width > options.maxWidth) {
                sharpInstance.resize({
                  width: options.maxWidth,
                  withoutEnlargement: true,
                });
              }
            }

            // Convert to webp with the specified quality
            await sharpInstance
              .webp({ quality: options.quality })
              .toFile(webpPath);

            // Get file size after conversion
            const webpStat = await fsExtra.stat(webpPath);
            stats.images.totalSizeAfter += webpStat.size;

            // Update stats
            stats.images.converted++;

            // Calculate savings for this image
            const savings = calculateSavings(fileStat.size, webpStat.size);

            console.log(
              `✅ Converted: ${entry.name} → ${webpFilename} (${savings.formattedSaved} saved, ${savings.percentage})`,
            );

            // Move original to replaced folder
            await fsExtra.move(
              entryPath,
              path.join(replacedFolder, entry.name),
              { overwrite: true },
            );
            console.log(`📦 Moved original to: ${replacedFolder}`);
          } catch (err) {
            console.error(`❌ Error converting ${entry.name}:`, err);
            stats.images.failed++;
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${folder}:`, error);
  }
}

async function replaceImageExtensionsRecursively(folder) {
  try {
    const entries = await fsExtra.readdir(folder, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(folder, entry.name);
      if (shouldSkip(entryPath)) continue;

      if (entry.isDirectory()) {
        await replaceImageExtensionsRecursively(entryPath);
      } else if (entry.isFile() && isTextFile(entry.name)) {
        let content;
        try {
          content = await fsExtra.readFile(entryPath, "utf8");
        } catch (err) {
          console.error(`❌ Error reading file ${entryPath}:`, err);
          continue;
        }

        const original = content;

        // Replace image extensions
        imgExtensions.forEach((ext) => {
          const escaped = ext.replace(".", "\\.");
          const regex = new RegExp(escaped + "(?=[?#\"'\\)\\s]|$)", "gi");
          content = content.replace(regex, ".webp");
        });

        // Update responsive image syntax if it exists
        if (content.includes("srcset") || content.includes("source")) {
          imgExtensions.forEach((ext) => {
            const escaped = ext.replace(".", "\\.");
            const srcsetRegex = new RegExp(
              `([\\w\\-./]+)${escaped}\\s+([\\w]+)`,
              "gi",
            );
            content = content.replace(srcsetRegex, (match, file, size) => {
              return `${file}.webp ${size}`;
            });
          });
        }

        if (content !== original) {
          try {
            await fsExtra.writeFile(entryPath, content, "utf8");
            console.log(`[🔄 Updated] ${entryPath}`);
          } catch (err) {
            console.error(`❌ Error writing file ${entryPath}:`, err);
          }
        } else {
          console.log(`[✅ No changes] ${entryPath}`);
        }
      }
    }
  } catch (error) {
    console.error(`Error updating references in directory ${folder}:`, error);
  }
}

function isValidCssFile(fileName) {
  return (
    path.extname(fileName).toLowerCase() === ".css" &&
    !fileName.endsWith(".min.css")
  );
}

function isValidHtmlFile(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  return ext === ".html" || ext === ".htm";
}

function isValidJsFile(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  return ext === ".js" && !fileName.endsWith(".min.js");
}

async function processCssFiles(folder, mode) {
  try {
    const entries = await fsExtra.readdir(folder, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(folder, entry.name);

      if (shouldSkip(entryPath)) continue;

      if (entry.isDirectory()) {
        await processCssFiles(entryPath, mode);
      } else if (entry.isFile() && isValidCssFile(entry.name)) {
        try {
          const cssContent = await fsExtra.readFile(entryPath, "utf8");
          let output;

          // Track file size before processing
          const fileStat = await fsExtra.stat(entryPath);
          stats.css.totalSizeBefore += fileStat.size;

          if (mode === "minify") {
            const result = new CleanCSS({
              level: 2,
              format: "keep-breaks",
            }).minify(cssContent);

            if (result.errors.length) {
              console.error(`❌ Error minifying ${entryPath}:`, result.errors);
              stats.css.failed++;
              continue;
            }
            output = result.styles;
          } else if (mode === "beautify") {
            output = beautify.css(cssContent, {
              indent_size: 2,
              end_with_newline: true,
              preserve_newlines: true,
              max_preserve_newlines: 2,
            });
          }

          await fsExtra.writeFile(entryPath, output, "utf8");

          // Track file size after processing
          const newFileStat = await fsExtra.stat(entryPath);
          stats.css.totalSizeAfter += newFileStat.size;
          stats.css.processed++;

          // Calculate savings
          const savings = calculateSavings(fileStat.size, newFileStat.size);
          console.log(
            `✅ ${mode === "minify" ? "Minified" : "Beautified"}: ${entry.name} (${savings.formattedSaved} ${mode === "minify" ? "saved" : "added"}, ${savings.percentage})`,
          );
        } catch (err) {
          console.error(`❌ Failed to process ${entryPath}:`, err);
          stats.css.failed++;
        }
      }
    }
  } catch (error) {
    console.error(`Error processing CSS files in directory ${folder}:`, error);
  }
}

async function processHtmlFiles(folder, mode) {
  try {
    const entries = await fsExtra.readdir(folder, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(folder, entry.name);

      if (shouldSkip(entryPath)) continue;

      if (entry.isDirectory()) {
        await processHtmlFiles(entryPath, mode);
      } else if (entry.isFile() && isValidHtmlFile(entry.name)) {
        try {
          const htmlContent = await fsExtra.readFile(entryPath, "utf8");
          let output;

          // Track file size before processing
          const fileStat = await fsExtra.stat(entryPath);
          stats.html.totalSizeBefore += fileStat.size;

          if (mode === "minify") {
            output = htmlMinifier.minify(htmlContent, {
              collapseWhitespace: true,
              removeComments: true,
              minifyCSS: true,
              minifyJS: true,
              removeRedundantAttributes: true,
              removeEmptyAttributes: true,
              removeScriptTypeAttributes: true,
              removeStyleLinkTypeAttributes: true,
            });
          } else if (mode === "beautify") {
            output = beautify.html(htmlContent, {
              indent_size: 2,
              end_with_newline: true,
              preserve_newlines: true,
              max_preserve_newlines: 2,
              wrap_line_length: 0,
              wrap_attributes: "auto",
            });
          }

          await fsExtra.writeFile(entryPath, output, "utf8");

          // Track file size after processing
          const newFileStat = await fsExtra.stat(entryPath);
          stats.html.totalSizeAfter += newFileStat.size;
          stats.html.processed++;

          // Calculate savings
          const savings = calculateSavings(fileStat.size, newFileStat.size);
          console.log(
            `✅ ${mode === "minify" ? "Minified" : "Beautified"}: ${entry.name} (${savings.formattedSaved} ${mode === "minify" ? "saved" : "added"}, ${savings.percentage})`,
          );
        } catch (err) {
          console.error(`❌ Failed to process ${entryPath}:`, err);
          stats.html.failed++;
        }
      }
    }
  } catch (error) {
    console.error(`Error processing HTML files in directory ${folder}:`, error);
  }
}

async function processJsFiles(folder, mode) {
  try {
    const entries = await fsExtra.readdir(folder, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(folder, entry.name);

      if (shouldSkip(entryPath)) continue;

      if (entry.isDirectory()) {
        await processJsFiles(entryPath, mode);
      } else if (entry.isFile() && isValidJsFile(entry.name)) {
        try {
          const jsContent = await fsExtra.readFile(entryPath, "utf8");
          let output;

          // Track file size before processing
          const fileStat = await fsExtra.stat(entryPath);
          stats.js.totalSizeBefore += fileStat.size;

          if (mode === "minify") {
            const result = await minifyJS(jsContent, {
              compress: {
                drop_console: false,
                drop_debugger: true,
              },
              mangle: true,
            });
            output = result.code;
          } else if (mode === "beautify") {
            output = beautify.js(jsContent, {
              indent_size: 2,
              end_with_newline: true,
              preserve_newlines: true,
              max_preserve_newlines: 2,
              space_after_anon_function: true,
            });
          }

          await fsExtra.writeFile(entryPath, output, "utf8");

          // Track file size after processing
          const newFileStat = await fsExtra.stat(entryPath);
          stats.js.totalSizeAfter += newFileStat.size;
          stats.js.processed++;

          // Calculate savings
          const savings = calculateSavings(fileStat.size, newFileStat.size);
          console.log(
            `✅ ${mode === "minify" ? "Minified" : "Beautified"}: ${entry.name} (${savings.formattedSaved} ${mode === "minify" ? "saved" : "added"}, ${savings.percentage})`,
          );
        } catch (err) {
          console.error(`❌ Failed to process ${entryPath}:`, err);
          stats.js.failed++;
        }
      }
    }
  } catch (error) {
    console.error(
      `Error processing JavaScript files in directory ${folder}:`,
      error,
    );
  }
}

function addLazyLoadingToImages(htmlContent) {
  // Add loading="lazy" to img tags that don't already have it
  return htmlContent.replace(
    /<img(?!\s+[^>]*\sloading=['"])(.*?)(\/?>)/gi,
    '<img$1 loading="lazy"$2',
  );
}

/**
 * Adds alt attributes to images in HTML files
 * Uses sequential naming: img-1, img-2, etc.
 */
async function addAltAttributesToImages(folder) {
  try {
    const entries = await fsExtra.readdir(folder, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(folder, entry.name);

      if (shouldSkip(entryPath)) continue;

      if (entry.isDirectory()) {
        await addAltAttributesToImages(entryPath);
      } else if (entry.isFile() && isValidHtmlFile(entry.name)) {
        try {
          let htmlContent = await fsExtra.readFile(entryPath, "utf8");
          const originalContent = htmlContent;

          // Counter for sequential naming
          let imgCounter = 1;

          // Add alt attributes to images
          htmlContent = htmlContent.replace(
            /<img(?![^>]*\salt=['"])(.*?)(\/?>)/gi,
            (match, attributes, endTag) => {
              const altName = `img-${imgCounter++}`;
              return `<img${attributes} alt="${altName}"${endTag}`;
            }
          );

          if (htmlContent !== originalContent) {
            await fsExtra.writeFile(entryPath, htmlContent, "utf8");
            const imagesAdded = imgCounter - 1;
            stats.altAttributes.added += imagesAdded;
            console.log(`✅ Added alt attributes to ${imagesAdded} images in ${entry.name}`);
          }
        } catch (err) {
          console.error(`❌ Error adding alt attributes to ${entryPath}:`, err);
          stats.altAttributes.failed++;
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${folder} for alt attributes:`, error);
  }
}

/**
 * Generates a sitemap.xml file for the website
 * Includes all HTML files
 */
async function generateSitemap(folder, baseUrl) {
  if (!baseUrl) {
    console.log("⚠️ No base URL provided for sitemap. Using example.com as placeholder.");
    baseUrl = "https://example.com";
  }

  // Remove trailing slash from baseUrl if present
  baseUrl = baseUrl.replace(/\/$/, "");

  const urls = [];
  const sitemapPath = path.join(folder, "sitemap.xml");

  // Find all HTML files
  async function findHtmlFiles(dir, relativePath = "") {
    try {
      const entries = await fsExtra.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const entryPath = path.join(dir, entry.name);
        const entryRelativePath = path.join(relativePath, entry.name);

        if (shouldSkip(entryPath)) continue;

        if (entry.isDirectory()) {
          await findHtmlFiles(entryPath, entryRelativePath);
        } else if (entry.isFile() && isValidHtmlFile(entry.name)) {
          // Convert Windows backslashes to forward slashes for URLs
          const urlPath = entryRelativePath.replace(/\\/g, "/");
          urls.push(`${baseUrl}/${urlPath}`);
        }
      }
    } catch (error) {
      console.error(`Error finding HTML files in ${dir}:`, error);
    }
  }

  await findHtmlFiles(folder);

  // Generate sitemap XML
  const timestamp = new Date().toISOString();
  let sitemapContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemapContent += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  urls.forEach(url => {
    sitemapContent += '  <url>\n';
    sitemapContent += `    <loc>${url}</loc>\n`;
    sitemapContent += `    <lastmod>${timestamp}</lastmod>\n`;
    sitemapContent += '    <changefreq>monthly</changefreq>\n';
    sitemapContent += '    <priority>0.8</priority>\n';
    sitemapContent += '  </url>\n';
  });

  sitemapContent += '</urlset>';

  try {
    await fsExtra.writeFile(sitemapPath, sitemapContent, "utf8");
    stats.sitemap.added = 1;
    stats.sitemap.urls = urls.length;
    console.log(`✅ Created sitemap at ${sitemapPath} with ${urls.length} URLs`);
  } catch (error) {
    console.error(`❌ Error writing sitemap:`, error);
  }
}

/**
 * Generates a robots.txt file
 */
async function generateRobotsTxt(folder, options = {}) {
  const { disallowPaths = [], allowPaths = [] } = options;
  const robotsPath = path.join(folder, "robots.txt");

  let content = "User-agent: *\n";
  
  // Add disallow paths
  disallowPaths.forEach(path => {
    content += `Disallow: ${path}\n`;
  });

  // Add allow paths
  allowPaths.forEach(path => {
    content += `Allow: ${path}\n`;
  });

  // Add sitemap reference if sitemap.xml exists
  const sitemapPath = path.join(folder, "sitemap.xml");
  if (await fsExtra.pathExists(sitemapPath)) {
    content += `\nSitemap: ${options.baseUrl ? options.baseUrl + "/sitemap.xml" : "/sitemap.xml"}\n`;
  }

  try {
    await fsExtra.writeFile(robotsPath, content, "utf8");
    stats.robots.created = true;
    console.log(`✅ Created robots.txt at ${robotsPath}`);
  } catch (error) {
    console.error(`❌ Error writing robots.txt:`, error);
  }
}

/**
 * Generates JSON-LD structured data for HTML pages to improve SEO
 * @param {String} folder - The root folder to process
 * @param {Object} options - Schema generation options
 * @returns {Promise<void>}
 */
async function generateSchemaMarkup(folder, options = {}) {
  const {
    siteType = 'WebSite',
    siteName = '',
    logoUrl = '',
    organization = null,
    contactPoint = null,
    defaultAuthor = '',
    defaultDescription = '',
    defaultImage = '',
    socialProfiles = []
  } = options;
  
  // Initialize stats if not already there
  if (!stats.schema) {
    stats.schema = {
      added: 0,
      failed: 0
    };
  }
  
  try {
    // Find all HTML files in the folder and its subfolders
    const entries = await fsExtra.readdir(folder, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(folder, entry.name);
      
      if (shouldSkip(entryPath)) continue;
      
      if (entry.isDirectory()) {
        await generateSchemaMarkup(entryPath, options);
      } else if (entry.isFile() && isValidHtmlFile(entry.name)) {
        try {
          // Read the HTML content
          let htmlContent = await fsExtra.readFile(entryPath, "utf8");
          
          // Check if schema markup already exists
          if (htmlContent.includes('<script type="application/ld+json">')) {
            console.log(`ℹ️ Schema markup already exists in ${entryPath}`);
            continue;
          }
          
          // Extract page title
          const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
          const pageTitle = titleMatch ? titleMatch[1].trim() : siteName;
          
          // Extract meta description
          const descriptionMatch = htmlContent.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
          const pageDescription = descriptionMatch ? descriptionMatch[1].trim() : defaultDescription;
          
          // Generate the appropriate schema based on page content and type
          let schemaData = {};
          
          // Basic WebSite schema for all pages
          if (siteType === 'WebSite') {
            schemaData = {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": siteName,
              "url": options.baseUrl || "",
              "description": pageDescription || defaultDescription
            };
            
            // Add search action if search functionality exists
            if (htmlContent.includes('<form') && htmlContent.includes('search')) {
              schemaData.potentialAction = {
                "@type": "SearchAction",
                "target": `${options.baseUrl || ""}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string"
              };
            }
          }
          
          // BlogPosting schema for blog posts
          if (entry.name.includes('blog') || entry.name.includes('post') || 
              folder.includes('blog') || folder.includes('posts')) {
            // Extract publish date
            const dateMatch = htmlContent.match(/<time.*?datetime=["'](.*?)["'].*?>|<meta.*?property=["']article:published_time["'].*?content=["'](.*?)["']/i);
            const publishDate = dateMatch ? (dateMatch[1] || dateMatch[2]) : new Date().toISOString();
            
            // Extract author
            const authorMatch = htmlContent.match(/<meta.*?name=["']author["'].*?content=["'](.*?)["']/i);
            const author = authorMatch ? authorMatch[1] : defaultAuthor;
            
            // Extract feature image
            const imageMatch = htmlContent.match(/<meta.*?property=["']og:image["'].*?content=["'](.*?)["']/i);
            const featureImage = imageMatch ? imageMatch[1] : defaultImage;
            
            schemaData = {
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": pageTitle,
              "description": pageDescription,
              "image": featureImage,
              "author": {
                "@type": "Person",
                "name": author
              },
              "publisher": organization || {
                "@type": "Organization",
                "name": siteName,
                "logo": {
                  "@type": "ImageObject",
                  "url": logoUrl
                }
              },
              "datePublished": publishDate,
              "dateModified": publishDate
            };
          }
          
          // Organization schema for about/contact pages
          if (entry.name.includes('about') || entry.name.includes('contact') || 
              folder.includes('about') || folder.includes('contact')) {
            schemaData = {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": siteName,
              "url": options.baseUrl || "",
              "logo": logoUrl,
              "description": pageDescription || defaultDescription
            };
            
            // Add social profiles if available
            if (socialProfiles.length > 0) {
              schemaData.sameAs = socialProfiles;
            }
            
            // Add contact point if available
            if (contactPoint) {
              schemaData.contactPoint = [contactPoint];
            }
          }
          
          // Product schema for product pages
          if (entry.name.includes('product') || folder.includes('product') ||
              entry.name.includes('shop') || folder.includes('shop')) {
            // Look for price information
            const priceMatch = htmlContent.match(/\$\s*(\d+(\.\d{1,2})?)/);
            const price = priceMatch ? priceMatch[1] : '';
            
            // Extract product image
            const productImageMatch = htmlContent.match(/<img.*?src=["'](.*?)["'].*?alt=["'](.*?)["']/i);
            const productImage = productImageMatch ? productImageMatch[1] : defaultImage;
            const productName = productImageMatch ? productImageMatch[2] : pageTitle;
            
            if (price) {
              schemaData = {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": productName,
                "description": pageDescription,
                "image": productImage,
                "offers": {
                  "@type": "Offer",
                  "price": price,
                  "priceCurrency": "USD",
                  "availability": "https://schema.org/InStock"
                }
              };
            }
          }
          
          // Generate schema markup
          const schemaScript = `
<script type="application/ld+json">
${JSON.stringify(schemaData, null, 2)}
</script>
`;
          
          // Add schema to the HTML content (before closing head tag)
          const updatedContent = htmlContent.replace('</head>', `${schemaScript}\n</head>`);
          
          if (updatedContent !== htmlContent) {
            // Write back to file
            await fsExtra.writeFile(entryPath, updatedContent, "utf8");
            stats.schema.added++;
            console.log(`✅ Added schema markup to ${entryPath}`);
          }
          
        } catch (err) {
          console.error(`❌ Failed to add schema markup to ${entryPath}:`, err);
          stats.schema.failed++;
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error generating schema markup:`, error);
  }
}

async function optimizeImagesForSEO(folder) {
  try {
    const entries = await fsExtra.readdir(folder, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(folder, entry.name);

      if (shouldSkip(entryPath)) continue;

      if (entry.isDirectory()) {
        await optimizeImagesForSEO(entryPath);
      } else if (entry.isFile() && isValidHtmlFile(entry.name)) {
        try {
          let htmlContent = await fsExtra.readFile(entryPath, "utf8");
          const original = htmlContent;

          // Add lazy loading to images
          htmlContent = addLazyLoadingToImages(htmlContent);

          // Add width and height attributes to prevent CLS (Cumulative Layout Shift)
          // This is a placeholder for future implementation as it requires image dimension analysis

          if (htmlContent !== original) {
            await fsExtra.writeFile(entryPath, htmlContent, "utf8");
            console.log(`[🔄 Added lazy loading to images in] ${entryPath}`);
          }
        } catch (err) {
          console.error(
            `❌ Failed to optimize images for SEO in ${entryPath}:`,
            err,
          );
        }
      }
    }
  } catch (error) {
    console.error(
      `Error optimizing images for SEO in directory ${folder}:`,
      error,
    );
  }
}

function printStats() {
  console.log("\n");
  
  // Glassmorphism effect for the header
  console.log('\x1b[38;5;39m\x1b[1m'); // Bright blue color with bold for glass effect
  console.log('╭────────────────────────────────────────────────────────────────────╮');
  console.log('│                                                                    │');
  console.log('│                      📊 OPTIMIZATION SUMMARY 📊                    │');
  console.log('│                                                                    │');
  console.log('╰────────────────────────────────────────────────────────────────────╯');
  console.log('\x1b[0m'); // Reset color
  
  // Create a smooth fade-in effect
  const sleep = (ms) => {
    const start = Date.now();
    while (Date.now() - start < ms) {}
  };
  
  sleep(100); // Small pause for visual effect

  // Image stats with glassmorphism effect
  if (stats.images.converted > 0) {
    const savings = calculateSavings(
      stats.images.totalSizeBefore,
      stats.images.totalSizeAfter,
    );
    
    // Small pause for visual transition effect
    sleep(150);
    
    // Glassmorphism effect
    console.log('\x1b[38;5;117m'); // Light blue color for glass effect
    console.log("\n  ✨ 🖼️  IMAGES");
    console.log(
      `     ╭─────────────────────────────────────────────────────────╮`
    );
    console.log(
      `     │  📊 Converted: ${stats.images.converted.toString().padEnd(8)}  │  ❌ Failed: ${stats.images.failed.toString().padEnd(8)}  │`
    );
    console.log(
      `     │  📥 Before: ${formatBytes(stats.images.totalSizeBefore).padEnd(12)} │  📤 After: ${formatBytes(stats.images.totalSizeAfter).padEnd(12)} │`
    );
    console.log(
      `     │  💾 Saved: ${savings.formattedSaved.padEnd(12)} │  📉 Reduction: ${savings.percentage.padEnd(8)} │`
    );
    console.log(
      `     ╰─────────────────────────────────────────────────────────╯`
    );
    console.log('\x1b[0m'); // Reset color
  }

  // CSS stats with glassmorphism effect
  if (stats.css.processed > 0) {
    const savings = calculateSavings(
      stats.css.totalSizeBefore,
      stats.css.totalSizeAfter,
    );
    
    // Small pause for visual transition effect
    sleep(150);
    
    // Glassmorphism effect for CSS stats
    console.log('\x1b[38;5;183m'); // Purple for CSS stats
    console.log("\n  ✨ 🎨 CSS");
    console.log(
      `     ╭─────────────────────────────────────────────────────────╮`
    );
    console.log(
      `     │  📊 Processed: ${stats.css.processed.toString().padEnd(7)}  │  ❌ Failed: ${stats.css.failed.toString().padEnd(8)}  │`
    );
    console.log(
      `     │  📥 Before: ${formatBytes(stats.css.totalSizeBefore).padEnd(12)} │  📤 After: ${formatBytes(stats.css.totalSizeAfter).padEnd(12)} │`
    );
    console.log(
      `     │  ${stats.css.totalSizeBefore > stats.css.totalSizeAfter ? "💾 Saved:" : "📈 Added:"} ${savings.formattedSaved.padEnd(12)} │  ${stats.css.totalSizeBefore > stats.css.totalSizeAfter ? "📉" : "📈"} Change: ${savings.percentage.padEnd(9)} │`
    );
    console.log(
      `     ╰─────────────────────────────────────────────────────────╯`
    );
    console.log('\x1b[0m'); // Reset color
  }

  // HTML stats with glassmorphism effect
  if (stats.html.processed > 0) {
    const savings = calculateSavings(
      stats.html.totalSizeBefore,
      stats.html.totalSizeAfter,
    );
    
    // Small pause for visual transition effect
    sleep(150);
    
    // Glassmorphism effect for HTML stats
    console.log('\x1b[38;5;222m'); // Orange for HTML stats
    console.log("\n  ✨ 📄 HTML");
    console.log(
      `     ╭─────────────────────────────────────────────────────────╮`
    );
    console.log(
      `     │  📊 Processed: ${stats.html.processed.toString().padEnd(7)}  │  ❌ Failed: ${stats.html.failed.toString().padEnd(8)}  │`
    );
    console.log(
      `     │  📥 Before: ${formatBytes(stats.html.totalSizeBefore).padEnd(12)} │  📤 After: ${formatBytes(stats.html.totalSizeAfter).padEnd(12)} │`
    );
    console.log(
      `     │  ${stats.html.totalSizeBefore > stats.html.totalSizeAfter ? "💾 Saved:" : "📈 Added:"} ${savings.formattedSaved.padEnd(12)} │  ${stats.html.totalSizeBefore > stats.html.totalSizeAfter ? "📉" : "📈"} Change: ${savings.percentage.padEnd(9)} │`
    );
    console.log(
      `     ╰─────────────────────────────────────────────────────────╯`
    );
    console.log('\x1b[0m'); // Reset color
  }

  // JS stats with glassmorphism effect
  if (stats.js.processed > 0) {
    const savings = calculateSavings(
      stats.js.totalSizeBefore,
      stats.js.totalSizeAfter,
    );
    
    // Small pause for visual transition effect
    sleep(150);
    
    // Glassmorphism effect for JS stats
    console.log('\x1b[38;5;156m'); // Green for JS stats
    console.log("\n  ✨ 📜 JAVASCRIPT");
    console.log(
      `     ╭─────────────────────────────────────────────────────────╮`
    );
    console.log(
      `     │  📊 Processed: ${stats.js.processed.toString().padEnd(7)}  │  ❌ Failed: ${stats.js.failed.toString().padEnd(8)}  │`
    );
    console.log(
      `     │  📥 Before: ${formatBytes(stats.js.totalSizeBefore).padEnd(12)} │  📤 After: ${formatBytes(stats.js.totalSizeAfter).padEnd(12)} │`
    );
    console.log(
      `     │  ${stats.js.totalSizeBefore > stats.js.totalSizeAfter ? "💾 Saved:" : "📈 Added:"} ${savings.formattedSaved.padEnd(12)} │  ${stats.js.totalSizeBefore > stats.js.totalSizeAfter ? "📉" : "📈"} Change: ${savings.percentage.padEnd(9)} │`
    );
    console.log(
      `     ╰─────────────────────────────────────────────────────────╯`
    );
    console.log('\x1b[0m'); // Reset color
  }
  
  // Alt attributes stats with glassmorphism effect
  if (stats.altAttributes.added > 0) {
    // Small pause for visual transition effect
    sleep(150);
    
    // Glassmorphism effect for alt attributes stats
    console.log('\x1b[38;5;219m'); // Pink for alt attributes
    console.log("\n  ✨ 🏷️ ALT ATTRIBUTES");
    console.log(
      `     ╭─────────────────────────────────────────────────────────╮`
    );
    console.log(
      `     │  ✓ Added: ${stats.altAttributes.added.toString().padEnd(12)}  │  ❌ Failed: ${stats.altAttributes.failed.toString().padEnd(8)}  │`
    );
    console.log(
      `     ╰─────────────────────────────────────────────────────────╯`
    );
    console.log('\x1b[0m'); // Reset color
  }
  
  // Sitemap stats with glassmorphism effect
  if (stats.sitemap.added > 0) {
    // Small pause for visual transition effect
    sleep(150);
    
    // Glassmorphism effect for sitemap stats
    console.log('\x1b[38;5;159m'); // Light blue for sitemap
    console.log("\n  ✨ 🗺️ SITEMAP");
    console.log(
      `     ╭─────────────────────────────────────────────────────────╮`
    );
    console.log(
      `     │  📊 Generated sitemap.xml with ${stats.sitemap.urls.toString().padEnd(7)} URLs${' '.repeat(20)}│`
    );
    console.log(
      `     ╰─────────────────────────────────────────────────────────╯`
    );
    console.log('\x1b[0m'); // Reset color
  }
  
  // Robots.txt stats with glassmorphism effect
  if (stats.robots.created) {
    // Small pause for visual transition effect
    sleep(150);
    
    // Glassmorphism effect for robots.txt stats
    console.log('\x1b[38;5;229m'); // Yellow for robots.txt
    console.log("\n  ✨ 🤖 ROBOTS.TXT");
    console.log(
      `     ╭─────────────────────────────────────────────────────────╮`
    );
    console.log(
      `     │  ✓ Generated robots.txt file successfully${' '.repeat(27)}│`
    );
    console.log(
      `     ╰─────────────────────────────────────────────────────────╯`
    );
    console.log('\x1b[0m'); // Reset color
  }
  
  // Schema markup stats with glassmorphism effect
  if (stats.schema && (stats.schema.added > 0 || stats.schema.failed > 0)) {
    // Small pause for visual transition effect
    sleep(150);
    
    // Glassmorphism effect for schema markup stats
    console.log('\x1b[38;5;141m'); // Purple for schema markup
    console.log("\n  ✨ 🔍 JSON-LD SCHEMA MARKUP");
    console.log(
      `     ╭─────────────────────────────────────────────────────────╮`
    );
    console.log(
      `     │  ✓ Added: ${stats.schema.added.toString().padEnd(6)}  │  ❌ Failed: ${stats.schema.failed.toString().padEnd(6)}${' '.repeat(27)}│`
    );
    console.log(
      `     ╰─────────────────────────────────────────────────────────╯`
    );
    console.log('\x1b[0m'); // Reset color
  }

  // Calculate total savings
  const totalBefore =
    stats.images.totalSizeBefore +
    stats.css.totalSizeBefore +
    stats.html.totalSizeBefore +
    stats.js.totalSizeBefore;
  const totalAfter =
    stats.images.totalSizeAfter +
    stats.css.totalSizeAfter +
    stats.html.totalSizeAfter +
    stats.js.totalSizeAfter;
  const totalSavings = calculateSavings(totalBefore, totalAfter);

  if (totalBefore > 0) {
    console.log(`\n🌟 TOTAL SAVINGS:`);
    console.log(
      `   Before: ${formatBytes(totalBefore)} | After: ${formatBytes(totalAfter)}`,
    );
    console.log(
      `   Total saved: ${totalSavings.formattedSaved} (${totalSavings.percentage})`,
    );
  }

  console.log("\n");
}

async function resetStats() {
  // Reset all statistics
  stats.images = {
    converted: 0,
    failed: 0,
    totalSizeBefore: 0,
    totalSizeAfter: 0,
  };
  stats.css = {
    processed: 0,
    failed: 0,
    totalSizeBefore: 0,
    totalSizeAfter: 0,
  };
  stats.html = {
    processed: 0,
    failed: 0,
    totalSizeBefore: 0,
    totalSizeAfter: 0,
  };
  stats.js = { processed: 0, failed: 0, totalSizeBefore: 0, totalSizeAfter: 0 };
}

// Load config from file if available
function loadConfig() {
  const configPath = path.join(process.cwd(), "seo-config.json");

  try {
    if (fsExtra.existsSync(configPath)) {
      const configData = fsExtra.readFileSync(configPath, "utf8");
      const config = JSON.parse(configData);
      console.log("✅ Configuration loaded from seo-config.json");
      return config;
    }
  } catch (error) {
    console.error("❌ Error loading configuration:", error.message);
  }

  // Return default config if file doesn't exist or has errors
  return {
    images: {
      quality: 80,
      resize: false,
      maxWidth: 1920,
      formats: imgExtensions,
    },
    minify: {
      css: { level: 2, format: "keep-breaks" },
      html: {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true,
      },
      js: {
        compress: {
          drop_console: false,
          drop_debugger: true,
        },
        mangle: true,
      },
    },
    beautify: {
      indent_size: 2,
      end_with_newline: true,
      preserve_newlines: true,
      max_preserve_newlines: 2,
    },
  };
}

async function main() {
  const config = loadConfig();

  // Show welcome message with glassmorphism design
  console.log('\x1b[38;5;51m'); // Set light cyan color for glassmorphism effect
  console.log(`
╭───────────────────────────────────────────╮
│                                           │
│        ✨  🚀  SeoToolKit v1.0  ✨        │
│                                           │
│     ⚜️  Crafted with ❤️  by Aether ⚜️     │
│                                           │
╰───────────────────────────────────────────╯
  `);
  console.log('\x1b[0m'); // Reset color

  while (true) {
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "task",
        message: "✨ SELECT OPTIMIZATION TASK:",
        choices: [
          new inquirer.Separator('━━━ 📊 IMAGE OPTIMIZATION ━━━'),
          {
            name: "🖼️  Convert images to WebP + Replace references",
            value: "convertReplace",
          },
          { name: "🔍 Advanced image conversion options", value: "advancedImage" },
          
          new inquirer.Separator('━━━ 📝 CODE OPTIMIZATION ━━━'),
          { name: "🎨 Minify CSS files", value: "minifyCss" },
          { name: "📄 Minify HTML files", value: "minifyHtml" },
          { name: "📜 Minify JavaScript files", value: "minifyJs" },
          { name: "🧹 Beautify code (CSS, HTML, JS)", value: "beautify" },
          
          new inquirer.Separator('━━━ 🌐 SEO ENHANCEMENTS ━━━'),
          { name: "⚡ Add lazy loading to images", value: "lazyLoad" },
          { name: "🏷️ Add alt attributes to images", value: "altAttributes" },
          { name: "🗺️ Generate sitemap.xml", value: "sitemap" },
          { name: "🤖 Generate robots.txt", value: "robots" },
          { name: "🔍 Generate JSON-LD schema markup", value: "schema" },
          
          new inquirer.Separator('━━━━━━━━━━━━━━━━━━━━━━━━━━━'),
          { name: "🚪 Exit", value: "exit" },
        ],
      },
    ]);

    // Reset stats at the beginning of each operation
    await resetStats();

    switch (answers.task) {
      case "convertReplace":
        console.log(`\n📂 Converting images in: ${process.cwd()}`);
        await convertImagesRecursively(process.cwd(), {
          quality: 80,
          resize: false,
          maxWidth: 1920,
        });
        console.log(`\n🔄 Updating image references in: ${process.cwd()}`);
        await replaceImageExtensionsRecursively(process.cwd());
        printStats();
        break;

      case "minifyCss":
        console.log(`\n🔧 Minifying CSS files in: ${process.cwd()}`);
        await processCssFiles(process.cwd(), "minify");
        printStats();
        break;

      case "minifyHtml":
        console.log(`\n🔧 Minifying HTML files in: ${process.cwd()}`);
        await processHtmlFiles(process.cwd(), "minify");
        printStats();
        break;

      case "minifyJs":
        console.log(`\n🔧 Minifying JavaScript files in: ${process.cwd()}`);
        await processJsFiles(process.cwd(), "minify");
        printStats();
        break;

      case "lazyLoad":
        console.log(
          `\n🌐 Adding lazy loading to images in HTML files: ${process.cwd()}`,
        );
        await optimizeImagesForSEO(process.cwd());
        console.log("\n✅ Lazy loading processing complete.\n");
        break;
        
      case "altAttributes":
        console.log(`\n🏷️ Adding alt attributes to images in HTML files...`);
        await addAltAttributesToImages(process.cwd());
        if (stats.altAttributes.added > 0) {
          console.log(
            `\n✅ Successfully added alt attributes to ${stats.altAttributes.added} images.`,
          );
        } else {
          console.log(`\n⚠️ No images were found without alt attributes.`);
        }
        break;
        
      case "sitemap":
        const sitemapOptions = await inquirer.prompt([
          {
            type: "input",
            name: "baseUrl",
            message: "Enter the base URL of your website (e.g., https://example.com):",
            default: "https://example.com",
            validate: (value) => {
              return value.match(/^https?:\/\/[a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}/)
                ? true
                : "Please enter a valid URL (e.g., https://example.com)";
            },
          },
        ]);
        
        console.log(`\n🗺️ Generating sitemap for ${sitemapOptions.baseUrl}...`);
        await generateSitemap(process.cwd(), sitemapOptions.baseUrl);
        
        if (stats.sitemap.added > 0) {
          console.log(
            `\n✅ Successfully generated sitemap.xml with ${stats.sitemap.urls} URLs.`,
          );
        } else {
          console.log(`\n❌ Failed to generate sitemap.xml.`);
        }
        break;
        
      case "robots":
        const robotsOptions = await inquirer.prompt([
          {
            type: "input",
            name: "baseUrl",
            message: "Enter the base URL of your website (optional):",
            default: "",
          },
          {
            type: "confirm",
            name: "addDisallowPaths",
            message: "Do you want to add paths to disallow in robots.txt?",
            default: false,
          },
          {
            type: "input",
            name: "disallowPaths",
            message: "Enter paths to disallow (comma separated, e.g., /admin, /private):",
            default: "/admin, /private, /cgi-bin",
            when: (answers) => answers.addDisallowPaths,
            filter: (value) => value.split(",").map(path => path.trim()),
          },
          {
            type: "confirm",
            name: "addAllowPaths",
            message: "Do you want to add specific paths to allow in robots.txt?",
            default: false,
          },
          {
            type: "input",
            name: "allowPaths",
            message: "Enter paths to allow (comma separated, e.g., /public):",
            default: "/public",
            when: (answers) => answers.addAllowPaths,
            filter: (value) => value.split(",").map(path => path.trim()),
          },
        ]);
        
        console.log(`\n🤖 Generating robots.txt...`);
        await generateRobotsTxt(process.cwd(), {
          baseUrl: robotsOptions.baseUrl || undefined,
          disallowPaths: robotsOptions.disallowPaths || [],
          allowPaths: robotsOptions.allowPaths || [],
        });
        
        if (stats.robots.created) {
          console.log(`\n✅ Successfully generated robots.txt.`);
        } else {
          console.log(`\n❌ Failed to generate robots.txt.`);
        }
        break;
        
      case "schema":
        // For schema markup, prompt for options
        const schemaOptions = await inquirer.prompt([
          {
            type: "list",
            name: "siteType",
            message: "What type of website is this?",
            choices: [
              { name: "Regular Website", value: "WebSite" },
              { name: "Blog", value: "Blog" },
              { name: "E-commerce/Products", value: "Store" },
              { name: "Organization/Business", value: "Organization" }
            ],
            default: "WebSite",
          },
          {
            type: "input",
            name: "siteName",
            message: "Website/Business name:",
            validate: (input) => input.length > 0 ? true : "Please enter a name",
          },
          {
            type: "input",
            name: "baseUrl",
            message: "Website URL (including https://):",
            default: "",
          },
          {
            type: "input",
            name: "logoUrl",
            message: "Logo URL (leave empty if none):",
            default: "",
          },
          {
            type: "input",
            name: "defaultAuthor",
            message: "Default author name for content:",
            default: "",
          },
          {
            type: "input",
            name: "defaultDescription",
            message: "Default site description:",
            default: "",
          },
          {
            type: "input",
            name: "socialProfiles",
            message: "Social media profiles (comma-separated URLs):",
            default: "",
            filter: (input) =>
              input ? input.split(",").map((item) => item.trim()) : [],
          },
        ]);
        
        // If organization type, ask for contact details
        let contactPoint = null;
        
        if (schemaOptions.siteType === "Organization") {
          const contactOptions = await inquirer.prompt([
            {
              type: "confirm",
              name: "includeContact",
              message: "Include contact information?",
              default: true,
            }
          ]);
          
          if (contactOptions.includeContact) {
            const contactDetails = await inquirer.prompt([
              {
                type: "input",
                name: "telephone",
                message: "Contact phone number:",
                default: "",
              },
              {
                type: "input",
                name: "email",
                message: "Contact email:",
                default: "",
              },
              {
                type: "list",
                name: "contactType",
                message: "Type of contact:",
                choices: [
                  "Customer Service", 
                  "Technical Support", 
                  "Sales", 
                  "Billing Support",
                  "General Inquiries"
                ],
                default: "Customer Service",
              }
            ]);
            
            if (contactDetails.telephone || contactDetails.email) {
              contactPoint = {
                "@type": "ContactPoint",
                "contactType": contactDetails.contactType,
                "telephone": contactDetails.telephone,
                "email": contactDetails.email
              };
            }
          }
        }

        console.log(`\n🔍 Generating JSON-LD schema markup in: ${process.cwd()}`);
        await generateSchemaMarkup(process.cwd(), {
          siteType: schemaOptions.siteType,
          siteName: schemaOptions.siteName,
          baseUrl: schemaOptions.baseUrl,
          logoUrl: schemaOptions.logoUrl,
          defaultAuthor: schemaOptions.defaultAuthor,
          defaultDescription: schemaOptions.defaultDescription,
          socialProfiles: schemaOptions.socialProfiles,
          contactPoint: contactPoint
        });
        
        if (stats.schema && stats.schema.added > 0) {
          console.log(`\n✅ Successfully added schema markup to ${stats.schema.added} HTML files.`);
        } else {
          console.log(`\n❌ No schema markup was added. Make sure your HTML files have <head> tags.`);
        }
        
        printStats();
        break;

      case "advancedImage":
        const imageOptions = await inquirer.prompt([
          {
            type: "number",
            name: "quality",
            message: "WebP quality (1-100):",
            default: 80,
            validate: (value) => {
              return value >= 1 && value <= 100
                ? true
                : "Please enter a value between 1 and 100";
            },
          },
          {
            type: "confirm",
            name: "resize",
            message: "Resize large images?",
            default: false,
          },
          {
            type: "number",
            name: "maxWidth",
            message: "Maximum image width (pixels):",
            default: 1920,
            when: (answers) => answers.resize,
            validate: (value) => {
              return value >= 100
                ? true
                : "Please enter a value of at least 100 pixels";
            },
          },
        ]);

        console.log(
          `\n📂 Converting images with custom settings in: ${process.cwd()}`,
        );
        console.log(
          `Quality: ${imageOptions.quality}%, Resize: ${imageOptions.resize ? "Yes" : "No"}${imageOptions.resize ? `, Max Width: ${imageOptions.maxWidth}px` : ""}`,
        );

        await convertImagesRecursively(process.cwd(), imageOptions);
        console.log(`\n🔄 Updating image references in: ${process.cwd()}`);
        await replaceImageExtensionsRecursively(process.cwd());
        printStats();
        break;

      case "beautify":
        const beautifyOptions = await inquirer.prompt([
          {
            type: "checkbox",
            name: "fileTypes",
            message: "Select file types to beautify:",
            choices: [
              { name: "CSS", value: "css" },
              { name: "HTML", value: "html" },
              { name: "JavaScript", value: "js" },
            ],
            validate: (value) => {
              return value.length > 0
                ? true
                : "Please select at least one file type";
            },
          },
        ]);

        console.log(
          `\n🧹 Beautifying selected file types in: ${process.cwd()}`,
        );

        if (beautifyOptions.fileTypes.includes("css")) {
          console.log(`\n🎨 Beautifying CSS files...`);
          await processCssFiles(process.cwd(), "beautify");
        }

        if (beautifyOptions.fileTypes.includes("html")) {
          console.log(`\n📄 Beautifying HTML files...`);
          await processHtmlFiles(process.cwd(), "beautify");
        }

        if (beautifyOptions.fileTypes.includes("js")) {
          console.log(`\n📜 Beautifying JavaScript files...`);
          await processJsFiles(process.cwd(), "beautify");
        }

        printStats();
        break;

      case "exit":
        console.log(
          "\n👋 Thanks for using the Ultimate SEO & Performance Toolkit! Goodbye!\n",
        );
        process.exit(0);
    }
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

// Start the program
main().catch((error) => {
  console.error("Error running the SEO Toolkit:", error);
});
