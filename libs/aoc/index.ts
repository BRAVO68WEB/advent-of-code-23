const today = new Date();

const day = today.getDate();

// Download input
Bun.spawn([
  "aoc",
  "-I",
  "-i",
  `../../input/${day}.txt`,
  "-d",
  day.toString(),
  "download",
]);

// Create new project
const proc = Bun.spawn(["bash", "../../scripts/init.sh"]);
const output = await new Response(proc.stdout).text();

console.log(output);
