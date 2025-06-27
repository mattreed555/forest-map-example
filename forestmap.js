const matrixSize = 20;
const squareSize = 20;
const totalTiles = matrixSize * matrixSize;
const howLongToWander = totalTiles * 15;

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
  
}

const colorMap = {
  yellow: "yellow",
  "yellow-brown":"goldenrod",
  "orange-red":"orangered",
  red:"firebrick",
  evergreen:"forestgreen",
  green:"limegreen",
  brown:"saddlebrown",
  purple:"rgb(63,3,63)",
}

const width = matrixSize * squareSize; 
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
          .attr('width', squareSize)
          .attr('height', squareSize)
          .attr('x', d => d.x * squareSize)
          .attr('y', d => d.y * squareSize)
          .attr('fill', d=> colorMap[d.leafColor])
          .text(d => d.speciesName ) 
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseleave", mouseleave);
  
  
  
}

const goLeft = x => (x==0?(matrixSize-1):x - 1);
const goRight = x => (x==(matrixSize-1)?0:x + 1);
const goUp = y => (y==0?(matrixSize-1):y - 1);
const goDown = y => (y==(matrixSize-1)?0:y + 1);

const randomWalk = (x, y) => {
  
  const dir = Math.floor(getRandom() * 8);
  

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

const isFree = (x, y, board) => {
  const hasLocation = board.find(f => f.x == x && f.y == y);
  return hasLocation == undefined;
};

const isMySpecies = (x, y, speciesName, board) => {
  
  const location = board.find(f => f.x == x && f.y == y);
  
  if (location == undefined) return false;
  
  return location.speciesName == speciesName;
  
};

const augmentWithNeighborhood = (tree, board) => {


  tree.topSameSpecies = isMySpecies(tree.x, goUp(tree.y), tree.speciesName, board);
  tree.bottomSameSpecies = isMySpecies(tree.x, goDown(tree.y), tree.speciesName, board);
  tree.leftSameSpecies = isMySpecies(goLeft(tree.x), tree.y, tree.speciesName, board);
  tree.rightSameSpecies = isMySpecies(goRight(tree.x), tree.y, tree.speciesName, board);
  
};

const randomWalkToFree = (x, y, board) => {
  let candidate = {x:x,y:y};
  for(let i = 0; i < howLongToWander; i++) {
    if (isFree(candidate.x, candidate.y, board)) {
      return candidate;
    }
    candidate = randomWalk(candidate.x, candidate.y);
  }
  return undefined;
}

const getRandomLocation = () => {
  const x = Math.floor(getRandom() * matrixSize);
  const y = Math.floor(getRandom() * matrixSize);
  return {x:x,y:y};
}

const plantTree = (board, freeLocation, species) => {
 board.push({ x: freeLocation.x, y: freeLocation.y, leafColor:species.leafColor, speciesName:species.speciesName });
}

const simulateForest = (data) => {
  
  let board = [];
  const speciesData = {};
  
  
  
  // Initial Planting
  for (const species of data) {
  
    const startingPoint = getRandomLocation();
    let freeLocation = randomWalkToFree(startingPoint.x, startingPoint.y, board);
    plantTree(board, freeLocation, species);
    
    console.log(species.appoximateLeaves);
    
    for (let i = 0; i < species.appoximateLeaves; i++) {
 
       
        let newfreeLocation = randomWalkToFree(freeLocation.x, freeLocation.y, board);
        
        // leave once we run out of tiles
        if(newfreeLocation == undefined) {
          return board;
        } 
     plantTree(board, newfreeLocation, species);
   
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
  //Species Name,Leaf Color,% Leaf Biomass
  const leafData =  data.map(datum => {return {
    speciesName: datum["Species Name"],
    leafColor: datum["Leaf Color"],
    appoximateLeaves: (Math.round(parseFloat(datum["% Leaf Biomass"])/100*totalTiles))
  }}); 
  
  const simulationResult = simulateForest(leafData);
  
  const myColors = analyzeForest(simulationResult);

  console.log(myColors);
  
  createMatrix(simulationResult);


});
