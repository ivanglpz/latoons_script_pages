import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
// import episodes from '../latoons/episodes.json' with { type: 'json' };
// import seasons from '../latoons/seasons.json' with { type: 'json' };
import series from '../latoons/series.json' with { type: 'json' };

dotenv.config();
cloudinary.v2.config({});

// Obtener el directorio actual usando import.meta.url
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const publicDir: string = path.join(__dirname, 'public');
// Create the public folder if it doesn't exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

function getFileNameFromUrl(url: string): string | null {
  const regex = /\/([^\/]+\.json)$/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

const handle = async () => {
  try {
    const PATHS = await cloudinary.v2.api.resources({
      prefix: 'app/latoons/public',
      type: 'upload',
      max_results: 500,
      resource_type: 'raw',
    });

    if (PATHS && PATHS.resources && PATHS.resources.length > 0) {
      console.log('Archivos encontrados:', PATHS.resources);

      const JSONSERIES = series?.map((e) => {
        return {
          ...e,
          //@ts-ignore
          resource: PATHS.resources.find((i) =>
            getFileNameFromUrl(i?.url)?.includes(e?.slug),
          )?.url,
        };
      });
      const filePath: string = path.join(publicDir, `seo.json`);

      // await cloudinary.v2.uploader.upload(filePath, {
      //   use_filename: true,
      //   unique_filename: false,
      //   overwrite: true,
      //   folder: 'app/latoons/public',
      //   resource_type: 'raw',
      // });
      fs.writeFileSync(filePath, JSON.stringify(JSONSERIES, null, 2), 'utf-8');
    } else {
      console.log('No se encontraron archivos en esa ruta.');
    }
  } catch (error) {
    console.log('Error al obtener los archivos:', error);
  }
};

handle();
