const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const tasks = [
  {
    src: 'public/piscinatramnoto.png',
    dest: 'public/piscinatramnoto_opt.webp',
    width: 1400
  },
  {
    src: 'public/aperitivo.png',
    dest: 'public/aperitivo_opt.webp',
    width: 1400
  },
  {
    src: 'public/poolside.jpg',
    dest: 'public/poolside_opt.webp',
    width: 1400
  },
  {
    src: 'public/villa.jpg',
    dest: 'public/villa_opt.webp',
    width: 1400
  },
  {
    src: 'public/party.jpg',
    dest: 'public/party_opt.webp',
    width: 1400
  }
];

async function run() {
  console.log('Starting image optimization with sharp...');
  for (const task of tasks) {
    if (!fs.existsSync(task.src)) {
      console.warn(`Source file not found: ${task.src}`);
      continue;
    }
    try {
      console.log(`Processing ${task.src} -> ${task.dest}...`);
      await sharp(task.src)
        .resize({
          width: task.width,
          height: task.width,
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({
          quality: 75,
          effort: 4
        })
        .toFile(task.dest);
      
      const stats = fs.statSync(task.dest);
      console.log(`Success! ${task.dest} is now ${(stats.size / 1024).toFixed(1)} KB.`);
    } catch (err) {
      console.error(`Error processing ${task.src}:`, err.message);
    }
  }
}

run();
