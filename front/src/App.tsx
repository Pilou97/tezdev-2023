import { useEffect, useState } from "react";
import "./App.css";
import { useBlock } from "./lib/hooks";
import { Buffer } from "buffer";

// Width of the map
const WIDTH = 16;
// Height of the map
const HEIGHT = 16;
// Ratio of the image, the UI is multiplied by the defined ratio
const RATIO = 3;
// Size of a cell
const CELL_SIZE = 16 * RATIO;
// Player size
const PLAYER_SIZE = 48 * RATIO;

const TEZOS_URI = "https://rpc.tzkt.io/ghostnet";

const ROLLUP_URI = "http://localhost:8932";

/**
 * Loads an image
 * @param path path of the image to load
 * @returns Image with the loaded image
 */
const load_img = (path: string) => {
  const img = new Image();
  return new Promise((resolve) => {
    img.addEventListener(
      "load",
      () => {
        resolve(img);
      },
      false
    );
    img.src = path;
  });
};

/**
 * Drawing the grass
 * @param ctx the canvas
 * @param grass image of grass
 */
const draw_grass = async (ctx: any, grass: any) => {
  for (let width = 0; width < WIDTH; width++) {
    for (let height = 0; height < HEIGHT; height++) {
      ctx.drawImage(
        grass,
        0,
        0,
        16,
        16,
        width * CELL_SIZE,
        height * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }
};

/**
 * Add some random decors on the map
 * @param ctx the canvas context
 * @param decors the tiles of the decors
 */
const draw_decors = async (ctx: any, decors: any) => {
  // Add some decors on the map
  // 20% of decors
  for (let i = 0; i < (WIDTH * HEIGHT) / 20; i++) {
    let randX = Math.floor(Math.random() * 4) * 16;
    let randY = Math.floor(Math.random() * 4) * 16;

    let x = (Math.floor(Math.random() * (WIDTH - 1)) + 1) * CELL_SIZE;
    let y = (Math.floor(Math.random() * (HEIGHT - 1)) + 1) * CELL_SIZE;

    ctx.drawImage(decors, randX, randY, 16, 16, x, y, CELL_SIZE, CELL_SIZE);
  }
};

/**
 * Add some fences arround the map
 * Purely decorative
 * @param ctx canvas context
 * @param fences fences tiles
 */
const draw_fences = async (ctx: any, fences: any) => {
  for (let width = 1; width < WIDTH - 1; width++) {
    // top
    let x = 2 * 16;
    let y = 3 * 16;
    // top
    ctx.drawImage(fences, x, y, 16, 16, width * CELL_SIZE, 0, CELL_SIZE, CELL_SIZE);
    // bottom
    ctx.drawImage(
      fences,
      x,
      y,
      16,
      16,
      width * CELL_SIZE,
      (HEIGHT - 1) * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE
    );
  }

  for (let height = 1; height < HEIGHT - 1; height++) {
    // left
    let x = 0 * 16;
    let y = 1 * 16;
    // left
    ctx.drawImage(fences, x, y, 16, 16, 0, height * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    // right
    ctx.drawImage(
      fences,
      x,
      y,
      16,
      16,
      (WIDTH - 1) * CELL_SIZE,
      height * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE
    );
  }
  // corners
  ctx.drawImage(fences, 16, 0, 16, 16, 0, 0, CELL_SIZE, CELL_SIZE);
  ctx.drawImage(fences, 16, 32, 16, 16, 0, (HEIGHT - 1) * CELL_SIZE, CELL_SIZE, CELL_SIZE);

  ctx.drawImage(fences, 48, 0, 16, 16, (WIDTH - 1) * CELL_SIZE, 0, CELL_SIZE, CELL_SIZE);
  ctx.drawImage(
    fences,
    48,
    32,
    16,
    16,
    (WIDTH - 1) * CELL_SIZE,
    (HEIGHT - 1) * CELL_SIZE,
    CELL_SIZE,
    CELL_SIZE
  );
};

type Position = {
  x: number;
  y: number;
};

type Item = "Sword" | "Potion"

const App = () => {
  const width = CELL_SIZE * WIDTH;
  const height = CELL_SIZE * HEIGHT;

  const [position, setPosition] = useState<Position | undefined>(undefined);
  const [inventory, setInventory] = useState<Array<Item> | undefined>(undefined);

  const getCtx = (id: string) => {
    const ctx = document.getElementById(id).getContext("2d");
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    return ctx;
  }

  const draw = async () => {
    const ctx = getCtx("canvas");
    const grass = await load_img("sprites/tilesets/grass.png");
    const decors = await load_img("sprites/tilesets/decor_16x16.png");
    const fences = await load_img("sprites/tilesets/fences.png");

    // Draw the grass
    await draw_grass(ctx, grass);

    // Draw some decors
    await draw_decors(ctx, decors);

    // Let's add some fence
    await draw_fences(ctx, fences);
  };

  // Drawing the player
  useEffect(() => {
    const ctx = getCtx("canvas-player");

    let frame = 1;
    let number_of_frame = 6;

    if (position) {
      const x = position.x * CELL_SIZE + (WIDTH / 2) * CELL_SIZE - PLAYER_SIZE / 2; // should be in the center of the map
      const y = position.y * CELL_SIZE + (HEIGHT / 2) * CELL_SIZE - PLAYER_SIZE / 2; // should be in the center of the map

      const draw_player_frame = async (frame_index: number) => {
        const player = await load_img("sprites/characters/player.png");
        ctx.clearRect(0, 0, WIDTH * CELL_SIZE, HEIGHT * CELL_SIZE);
        ctx.drawImage(
          player,
          frame_index * 48,
          0,
          48,
          48,
          x,
          y,
          PLAYER_SIZE,
          PLAYER_SIZE)
      };
      draw_player_frame(0);

      const id = setInterval(async () => {
        draw_player_frame(frame);
        frame = (frame + 1) % number_of_frame;
      }, 350);

      return () => {
        clearInterval(id);
      };
    }
    return () => { };
  }, [position]);

  // Drawing the map
  useEffect(() => {
    draw();
  }, []);

  useBlock(() => {
    // fetch player
    fetch("http://localhost:8932/global/block/head/durable/wasm_2_0_0/value?key=/player")
      .then(res => res.json())
      .then(payload => {
        console.log(payload)
        const x_str = payload.slice(0, 8);
        const y_str = payload.slice(8, 16);

        let x = Buffer.from(x_str, 'hex').readInt32BE();
        let y = Buffer.from(y_str, 'hex').readInt32BE();

        setPosition({ x, y });
      });

    // TODO: setPlayerPosition
    // TODO: setInventory
  }, { rpc: TEZOS_URI });

  /**
   * Moves the player
   * It uses the batcher injection endpoint
   * @param direction enum that represent the different possible directions
   * @returns nothing important
   */
  const move = async (direction: "up" | "down" | "left" | "right") => {
    // curl -H "Content-Type: application/json" -vvv -d '["01"]' -X POST "http://localhost:8932/local/batcher/injection"
    let payload = direction === "up" ? ["01"] : direction === "down" ? ["02"] : direction === "left" ? ["03"] : ["04"];
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    let url = `${ROLLUP_URI}/local/batcher/injection`;
    return fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
  }

  // bind keys
  useEffect(() => {
    document.onkeydown = (e) => {
      switch (e.key) {
        case "ArrowUp": {
          move("up")
          break;
        }
        case "ArrowDown": {
          move("down");
          break;
        }
        case "ArrowLeft": {
          move("left");
          break;
        }
        case "ArrowRight": {
          move("right");
          break;
        }
        default:
          break;
      }
    };
  }, []);

  // Fetch on each block the player
  // Needs to be "version agnostic"

  return (
    <div style={{ width, height, position: "relative" }}>
      <canvas
        width={width}
        height={height}
        style={{ width, height }}
        id="canvas"
      ></canvas>
      <canvas
        width={width}
        height={height}
        style={{ width, height }}
        id="canvas-player"
      ></canvas>
    </div>
  );
};

export default App;
