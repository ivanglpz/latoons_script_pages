import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import episodes from '../latoons/episodes.json' with { type: 'json' };
import seasons from '../latoons/seasons.json' with { type: 'json' };
import series from '../latoons/series.json' with { type: 'json' };

console.log('LOADING CONFIG');

dotenv.config();
cloudinary.v2.config({});

// Obtener el directorio actual usando import.meta.url
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const publicDir: string = path.join(__dirname, 'public');
// Create the public folder if it doesn't exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

type Serie = {
  _id: {
    $oid: string;
  };
  id: string;
  created_at: string;
  background: string;
  image: string;
  language: string;
  productionYear: number;
  review: string;
  status: 'PUBLISHED' | 'DRAFT'; // o cualquier otro estado que puedas tener
  studioId: string;
  title: string;
  valoration: number;
  slug: string;
};

type Season = {
  _id: {
    $oid: string;
  };
  id: string;
  created_at: string;
  serieId: string;
  title: string;
};

type Episode = {
  _id: {
    $oid: string;
  };
  id: string;
  created_at: string;
  title: string;
  seasonId: string;
  numberEpisode: number;
  video: string;
  slug: string;
};

const removeText = (title: string) => title?.replace(/\D/g, '');

console.log('START SEARCHING SEASONS AND EPISODES');

for (const serie of series) {
  const seasonsEpisodes = seasons
    ?.filter((e) => e?.serieId === serie?.id)
    ?.sort((a, b) => {
      const one = removeText(a?.title);
      const two = removeText(b?.title);

      return Number(one) - Number(two);
    });

  const seasonsWithEpisodes = seasonsEpisodes?.reduce(
    (acc, curr) => {
      const payload = {
        season: curr,
        //@ts-ignore
        episodes:
          episodes
            //@ts-ignore
            ?.filter((i) => i?.seasonId === curr?.id)
            //@ts-ignore
            ?.sort((a, b) => a?.numberEpisode - b?.numberEpisode) ?? [],
      };

      return [...acc, payload];
    },
    [] as { season: Season; episodes: Episode[] }[],
  );

  const DATA_JSON = {
    serie,
    seasons: seasonsWithEpisodes,
  };

  const filePath: string = path.join(
    publicDir,
    `${DATA_JSON?.serie?.slug}.json`,
  );

  //   await cloudinary.v2.uploader.upload(filePath, {
  //     use_filename: true,
  //     unique_filename: false,
  //     overwrite: true,
  //     folder: 'app/latoons/public',
  //     resource_type: 'raw',
  //   });
  fs.writeFileSync(filePath, JSON.stringify(DATA_JSON, null, 2), 'utf-8');
}
