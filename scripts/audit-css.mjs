import fs from 'fs'
import path from 'path'

const root = process.cwd()
const srcRoot = path.join(root, 'src')
const cssFiles = [
  'src/styles/tokens.css',
  'src/styles/base.css',
  'src/styles/layout.css',
  'src/styles/components.css',
  'src/styles/customer.css',
  'src/styles/landing.css',
  'src/styles/pages.css',
  'src/styles/print.css',
  'src/styles/shell.css',
  'src/styles/admin.css',
]

const importedCss = new Set()
const allCss = []

for (const file of cssFiles) {
  const full = path.join(root, file)
  if (fs.existsSync(full)) {
    allCss.push(file)
    const raw = fs.readFileSync(full, 'utf8')
    const matches = [...raw.matchAll(/\.([A-Za-z0-9_-]+)/g)].map((m) => m[1])
    for (const selector of matches) importedCss.add(selector)
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...walk(full))
    else if (entry.isFile() && /\.jsx?$/.test(entry.name)) files.push(full)
  }
  return files
}

const jsxFiles = walk(srcRoot)
const classUsage = new Map()

for (const file of jsxFiles) {
  const relative = path.relative(root, file).replace(/\\/g, '/')
  const source = fs.readFileSync(file, 'utf8')
  const matches = [...source.matchAll(/className\s*=\s*['\"]([^'\"]+)['\"]/g)]
  const templateMatches = [...source.matchAll(/className\s*=\s*`([^`]+)`/g)]
  const tokens = new Set()

  for (const match of matches) {
    for (const token of match[1].split(/\s+/)) {
      if (token) tokens.add(token)
    }
  }

  for (const match of templateMatches) {
    for (const token of match[1].split(/\s+/)) {
      if (token && !token.includes('${')) tokens.add(token)
    }
  }

  if (tokens.size) classUsage.set(relative, [...tokens].sort())
}

const missingByFile = new Map()
for (const [file, tokens] of classUsage) {
  const missing = tokens.filter((token) => !importedCss.has(token))
  if (missing.length) missingByFile.set(file, missing)
}

console.log('CSS files detected:')
for (const file of allCss) console.log(' -', file)
console.log('\nFiles with JSX classes not found in imported CSS:')
if (!missingByFile.size) {
  console.log(' - none')
} else {
  for (const [file, tokens] of [...missingByFile.entries()].sort()) {
    console.log(`\n[${file}]`)
    for (const token of tokens) console.log(' -', token)
  }
}

const selectorMap = new Map()
for (const file of allCss) {
  const full = path.join(root, file)
  const raw = fs.readFileSync(full, 'utf8')
  const regex = /\.([A-Za-z0-9_-]+)/g
  let match
  while ((match = regex.exec(raw))) {
    const className = match[1]
    if (!selectorMap.has(className)) selectorMap.set(className, [])
    selectorMap.get(className).push(file)
  }
}

const duplicates = [...selectorMap.entries()].filter(([, files]) => files.length > 1).sort(([a], [b]) => a.localeCompare(b))
console.log('\nDuplicate/conflicting class definitions:')
if (!duplicates.length) {
  console.log(' - none')
} else {
  for (const [className, files] of duplicates) {
    console.log(` - .${className}: ${files.join(', ')}`)
  }
}
