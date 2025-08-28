const MATRIX_SIZE = 20;
const SQUARE_SIZE = 20;
const TOTAL_TILES = MATRIX_SIZE * MATRIX_SIZE;
const HOW_LONG_TO_WANDER = TOTAL_TILES * 15;
const NUM_DIRECTIONS = 8;
const WANDER_MULTIPLIER = 15;

// we want to have the vis be stable so use seedrandom library to keep the output the same every refresh
Math.seedrandom('For KC');

// I can't remember where I got this alrgorithm from!!!
var M = 4294967296,
    // a - 1 should be divisible by m's prime factors
    A = 1664525,
    // c and m should be co-prime
    C = 1,
    Z = Math.floor(Math.random() * M);

const getRandom = () => {
  Z = (A * Z + C) % M;
  return Math.abs(Z / M - 0.5);
};

const colorMap = {
  yellow: "yellow",
  "yellow-brown": "goldenrod",
  "orange-red": "orangered",
  red: "firebrick",
  evergreen: "forestgreen",
  green: "limegreen",
  brown: "saddlebrown",
  purple: "rgb(63,3,63)"
};

const width = MATRIX_SIZE * SQUARE_SIZE; 
const height = width; 

const createMatrix = (data) => {
  
  const matrix = d3
      .select("#viz")
      .append("svg")
      .attr("viewbox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height);
  
  const treeGroups = matrix.selectAll('g')
         .data(data)
         .join('g');
  
  // create a tooltip
  var Tooltip = d3.select("#viz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");


  const mouseover = function(event, d) {
    Tooltip
      .style("opacity", 1);
    d3.select(this)
      .style("filter", "brightness(65%)");
  }

  const mousemove = function(event, d) {
    Tooltip
      .html(`${d.speciesName}`)
      .style("left", (event.x - 45) + "px") 
      .style("top", (event.y) + "px");
    
  }

  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  const mouseleave = function(event,d) {
    Tooltip
      .style("opacity", 0);
    d3.select(this)
      .style("filter", "brightness(100%)");
  }
  
  treeGroups.append('rect')
    .attr('width', SQUARE_SIZE)
    .attr('height', SQUARE_SIZE)
    .attr('x', d => d.x * SQUARE_SIZE)
    .attr('y', d => d.y * SQUARE_SIZE)
    .attr('fill', d => colorMap[d.leafColor])
    .text(d => d.speciesName)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);
  
  
  
}

const goLeft = x => (x === 0 ? (MATRIX_SIZE - 1) : x - 1);
const goRight = x => (x === (MATRIX_SIZE - 1) ? 0 : x + 1);
const goUp = y => (y === 0 ? (MATRIX_SIZE - 1) : y - 1);
const goDown = y => (y === (MATRIX_SIZE - 1) ? 0 : y + 1);

const randomWalk = (x, y) => {
  
  const dir = Math.floor(getRandom() * NUM_DIRECTIONS);
  

  const staySame = i => i;
  
   switch (dir) {
    case 0:
      return {x:staySame(x), y:goUp(y)};
    case 1:
      return {x:goRight(x), y:goUp(y)};
    case 2:
      return {x:goRight(x), y:staySame(y)};
    case 3:
      return {x:goRight(x), y:goDown(y)};
    case 4:
      return {x:staySame(x), y:goDown(y)};
    case 5:
      return {x:goLeft(x), y:goDown(y)};
    case 6:
      return {x:goLeft(x), y:staySame(y)};
    case 7:
      return {x:goLeft(x), y:goUp(y)};

  }
  
}

const isFree = (x, y, grid) => {
  return grid[y][x] === null;
};

const isMySpecies = (x, y, speciesName, grid) => {
  const location = grid[y][x];
  if (location === null) return false;
  return location.speciesName === speciesName;
};


const randomWalkToFree = (x, y, grid) => {
  let candidate = {x: x, y: y};
  for(let i = 0; i < HOW_LONG_TO_WANDER; i++) {
    if (isFree(candidate.x, candidate.y, grid)) {
      return candidate;
    }
    candidate = randomWalk(candidate.x, candidate.y);
  }
  return undefined;
}

const getRandomLocation = () => {
  const x = Math.floor(getRandom() * MATRIX_SIZE);
  const y = Math.floor(getRandom() * MATRIX_SIZE);
  return {x:x,y:y};
}

const plantTree = (board, grid, freeLocation, species) => {
  const tree = { x: freeLocation.x, y: freeLocation.y, leafColor: species.leafColor, speciesName: species.speciesName };
  board.push(tree);
  grid[freeLocation.y][freeLocation.x] = tree;
}

const simulateForest = (data) => {
  
  let board = [];
  // Create 2D lookup grid for performance
  const grid = Array(MATRIX_SIZE).fill(null).map(() => Array(MATRIX_SIZE).fill(null));
  const speciesData = {};
  
  
  
  // Initial Planting
  for (const species of data) {
  
    const startingPoint = getRandomLocation();
    let freeLocation = randomWalkToFree(startingPoint.x, startingPoint.y, grid);
    plantTree(board, grid, freeLocation, species);
    
    console.log(species.approximateLeaves);
    
    for (let i = 0; i < species.approximateLeaves; i++) {
 
       
        let newfreeLocation = randomWalkToFree(freeLocation.x, freeLocation.y, grid);
        
        // leave once we run out of tiles
        if(newfreeLocation == undefined) {
          return board;
        } 
     plantTree(board, grid, newfreeLocation, species);
   
      freeLocation = newfreeLocation;
          
    }
    
    
  }
    
  
  
}

const analyzeForest = (board) => {
  
  var myColors = {};
  
    for (let tree of board) {
    
      if (myColors[tree.leafColor] === undefined) {
        myColors[tree.leafColor]  = 1;
      }
      else {
        myColors[tree.leafColor]++;
      }
    
  }
   
  return myColors;
}

d3.csv("./leaf-data.csv").then(data => {
  // Species Name,Leaf Color,% Leaf Biomass
  const leafData = data.map(datum => {
    return {
      speciesName: datum["Species Name"],
      leafColor: datum["Leaf Color"],
      approximateLeaves: Math.round(parseFloat(datum["% Leaf Biomass"]) / 100 * TOTAL_TILES)
    };
  }); 
  
  const simulationResult = simulateForest(leafData);
  
  const myColors = analyzeForest(simulationResult);

  console.log(myColors);
  
  createMatrix(simulationResult);

}).catch(error => {
  console.error("Failed to load tree data:", error);
  document.getElementById("viz").innerHTML = "<p>Error loading visualization data. Please check that leaf-data.csv is available.</p>";
});
