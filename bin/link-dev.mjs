#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function linkDev() {
  const hostCwd = process.cwd();
  const viteConfigTsPath = path.join(hostCwd, 'vite.config.ts');
  const viteConfigJsPath = path.join(hostCwd, 'vite.config.js');
  
  let targetConfigPath = null;
  
  try {
    await fs.access(viteConfigTsPath);
    targetConfigPath = viteConfigTsPath;
  } catch {
    try {
      await fs.access(viteConfigJsPath);
      targetConfigPath = viteConfigJsPath;
    } catch {
      console.error('❌ Erreur : Aucun fichier vite.config.ts/js trouvé dans le dossier courant.');
      process.exit(1);
    }
  }

  const libSrcPath = path.resolve(__dirname, '../src').replace(/\\/g, '/');
  const libName = 'volcanium-components';
  
  const possibleCssFiles = ['src/index.css', 'src/main.css', 'src/App.css', 'src/globals.css', 'src/style.css'];
  for (const file of possibleCssFiles) {
    try {
      const cssPath = path.join(hostCwd, file);
      let cssContent = await fs.readFile(cssPath, 'utf-8');
      const sourceDirective = `@source "${libSrcPath}";`;
      const importDirective = `@import "${libName}/index.css";`;
      
      let modified = false;
      if (!cssContent.includes(sourceDirective) && (cssContent.includes('@import "tailwindcss"') || cssContent.includes("@import 'tailwindcss'"))) {
        cssContent = cssContent.replace(/@import ['"]tailwindcss['"];?/, `$& \n${sourceDirective}\n${importDirective}`);
        modified = true;
      } else if (!cssContent.includes(importDirective)) {
        cssContent = cssContent.replace(sourceDirective, `${sourceDirective}\n${importDirective}`);
        modified = true;
      }

      if (modified) {
        await fs.writeFile(cssPath, cssContent, 'utf-8');
        console.log(`🎨 Tailwind @source et @import ajoutés dans ${file}`);
      }
      break; // Stop après avoir trouvé et traité le premier fichier CSS
    } catch {}
  }

  // HTML Fonts Injection
  const indexPath = path.join(hostCwd, 'index.html');
  try {
    let indexContent = await fs.readFile(indexPath, 'utf-8');
    const fontsTags = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Rammetto+One&display=swap" rel="stylesheet">`;
    
    if (!indexContent.includes('family=DM+Sans') && indexContent.includes('</head>')) {
      indexContent = indexContent.replace('</head>', `${fontsTags}\n  </head>`);
      await fs.writeFile(indexPath, indexContent, 'utf-8');
      console.log(`🖋️ Polices DM Sans et Rammetto One ajoutées dans index.html`);
    }
  } catch (err) {
    // Si index.html n'existe pas ou qu'il y a une erreur de lecture, on ignore silencieusement
  }

  // TS/JS Config (VSCode IntelliSense)
  const possibleTsConfigs = ['jsconfig.json', 'tsconfig.app.json', 'tsconfig.json'];
  let tsConfigUpdated = false;
  const relativeLibSrcPath = path.relative(hostCwd, libSrcPath).replace(/\\/g, '/');
  
  for (const file of possibleTsConfigs) {
    const configPath = path.join(hostCwd, file);
    try {
      let content = await fs.readFile(configPath, 'utf-8');
      if (content.includes('"compilerOptions"')) {
        const pathsInjection = `"paths": {\n      "${libName}": ["${relativeLibSrcPath}/index.ts"],\n      "${libName}/*": ["${relativeLibSrcPath}/*"]\n    },`;
        if (!content.includes(`"${libName}":`)) {
           content = content.replace(/"compilerOptions"\s*:\s*\{/, `$& \n    ${pathsInjection}`);
           await fs.writeFile(configPath, content, 'utf-8');
           console.log(`📝 Autocomplétion VSCode ajoutée dans ${file}`);
        }
        tsConfigUpdated = true;
        break;
      }
    } catch {}
  }
  
  if (!tsConfigUpdated) {
    const jsconfigPath = path.join(hostCwd, 'jsconfig.json');
    try {
      await fs.access(jsconfigPath);
    } catch {
      const basicJsConfig = {
        compilerOptions: {
          target: "ESNext",
          module: "ESNext",
          moduleResolution: "bundler",
          jsx: "react-jsx",
          baseUrl: ".",
          paths: {
            [libName]: [`${relativeLibSrcPath}/index.ts`],
            [`${libName}/*`]: [`${relativeLibSrcPath}/*`]
          }
        },
        include: ["src"]
      };
      await fs.writeFile(jsconfigPath, JSON.stringify(basicJsConfig, null, 2), 'utf-8');
      console.log(`📝 Fichier jsconfig.json créé pour l'autocomplétion VSCode.`);
    }
  }

  let configContent = await fs.readFile(targetConfigPath, 'utf-8');
  
  if (configContent.includes(`'${libName}'`) || configContent.includes(`"${libName}"`)) {
    console.log(`✅ L'alias pour '${libName}' est déjà configuré.`);
    process.exit(0);
  }

  console.log(`🔧 Injection de l'alias global vers ${libSrcPath}...`);

  const aliasCode = `\n  resolve: {\n    dedupe: ['react', 'react-dom', 'react-router-dom'],\n    alias: {\n      '${libName}': '${libSrcPath}'\n    }\n  },`;

  if (configContent.includes('resolve:') && configContent.includes('alias:')) {
    configContent = configContent.replace(
      /alias:\s*{/,
      `dedupe: ['react', 'react-dom', 'react-router-dom'],\n    alias: {\n      '${libName}': '${libSrcPath}',`
    );
  } else if (configContent.includes('defineConfig({')) {
    configContent = configContent.replace('defineConfig({', `defineConfig({${aliasCode}`);
  } else if (configContent.includes('export default {')) {
    configContent = configContent.replace('export default {', `export default {${aliasCode}`);
  } else {
    console.error('❌ Erreur : Structure defineConfig non reconnue.');
    process.exit(1);
  }

  await fs.writeFile(targetConfigPath, configContent, 'utf-8');
  console.log(`🎉 Succès : Ton projet pointe désormais vers ton code local !`);
}

linkDev().catch((err) => {
  console.error('❌ Erreur :', err);
  process.exit(1);
});
