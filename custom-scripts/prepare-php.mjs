import path from "path"
import nextConfig from "../next.config.mjs"
import { fileURLToPath } from "url"
import fs from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const translationsFile = path.resolve(__dirname, "../lib/translations.ts")
const translationsText = fs.readFileSync(translationsFile, "utf-8")
const line = translationsText
    .split("\n")
    .find((line) => line.includes("export const languages"))

const value = line.split("=")[1].trim()
const languages = JSON.parse(value)

const indexPhpContent = /*php*/ `<?php
/* Don't edit manually. This is generated by "prepare-php.mjs". */
$lang = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2);

$basePath = "${nextConfig.basePath}";
$path = $_SERVER['REQUEST_URI'];
$path = str_replace($basePath, '', $path);

switch ($lang){
${languages
    .map(
        (lang) => `    case "${lang}": 
        header("Location: ". $basePath . "/${lang}" . $path);
        break;`
    )
    .join(`\n`)}
    default:
        header("Location: ". $basePath . "/${languages[0]}" . $path);
        break;
}`

fs.writeFileSync(
    path.resolve(__dirname, "../public/index.php"),
    indexPhpContent
)

const htaccessContent = /*htaccess*/ `# Don't edit manually. This is generated by "prepare-php.mjs".
ErrorDocument 404 ${nextConfig.basePath}/index.php`

fs.writeFileSync(
    path.resolve(__dirname, "../public/.htaccess"),
    htaccessContent
)