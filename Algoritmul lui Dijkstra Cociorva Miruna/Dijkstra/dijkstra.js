let Nodes = document.getElementsByClassName("drawing-area")[0];
let addEdge = false;
let cnt = 0;
let dist; 
 
// funcția este apelată când utilizatorul adaugă muchii apăsând pe un nod
const addEdges = () => 
{
  if (cnt < 2) {
    alert("Trebuie măcar 2 noduri pentru a adăuga o muchie!");
    return;
  }
  addEdge = true;
  document.getElementById("add-edge-enable").disabled = true;
  document.getElementsByClassName("run-btn")[0].disabled = false; 
  // inițializare vector pentru reprezentarea matricei de adiacență
  dist = new Array(cnt + 1)
    .fill(Infinity)
    .map(() => new Array(cnt + 1).fill(Infinity));
};
 
// matrice temporară
// ține minte nodurile pe care s-a apăsat click pentru a se crea o muchie între ele
// max size = 2
let arr = [];

const addNode = (x, y) => 
{
  document.querySelector(".reset-btn").disabled = false;
  document.querySelector(".click-instruction").style.display = "none";
  // creare nod
  const Node = document.createElement("div");
  Node.classList.add("Node");
  Node.style.top = `${y}px`;
  Node.style.left = `${x}px`;
  Node.style.transform = `translate(-50%,-50%)`;
  Node.id = cnt;

  Node.innerText = cnt++;

  // eveniment pentru desenare nod
  Node.addEventListener("click", (e) => 
  { 
    // prevenirea apariției de noduri care se suprapun
    e.stopPropagation() || (window.event.cancelBubble = "true");
 
    // dacă variabila addEdge e nulă nu se pot adăuga muchii
    if (!addEdge) return;

    Node.style.backgroundColor = "MediumSlateBlue";
    arr.push(Node.id);
 
    // când sunt 2 noduri se desenează muchia și se golește matricea
    if (arr.length === 2) 
    {
      drawUsingId(arr);
      arr = [];
    }
  });
  Nodes.appendChild(Node);
};

// click pe ecran pentru a se adăuga un nou nod
Nodes.addEventListener("click", (e) => 
{
  if (addEdge) return;
  if (cnt > 15) 
  {
    alert("Nu se pot adăuga mai mult de 15 noduri!");
    return;
  }
  //console.log(e.x, e.y);
  addNode(e.x, e.y);
});
 
// funcție care desenează o muchie între 2 noduri
const drawLine = (x1, y1, x2, y2, ar) => 
{ 
  // previne muchii multiple pentru aceeași pereche de noduri
  if (dist[Number(ar[0])][Number(ar[1])] !== Infinity) {
    document.getElementById(arr[0]).style.backgroundColor = "#333";
    document.getElementById(arr[1]).style.backgroundColor = "#333";
    return;
  }

  //console.log(ar);
  // lungimea muchiei 
  const len = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
  const slope = x2 - x1 ? (y2 - y1) / (x2 - x1) : y2 > y1 ? 90 : -90;

  // adaugăm lungimea muchiei la vectorul cu distanțe
  dist[Number(ar[0])][Number(ar[1])] = Math.round(len / 10);
  dist[Number(ar[1])][Number(ar[0])] = Math.round(len / 10);

  // desenăm linia
  const line = document.createElement("div");
  line.id =
    Number(ar[0]) < Number(ar[1])
      ? `line-${ar[0]}-${ar[1]}`
      : `line-${ar[1]}-${ar[0]}`;
  line.classList.add("line");
  line.style.width = `${len}px`;
  line.style.left = `${x1}px`;
  line.style.top = `${y1}px`;

  // lungimea muchiei 
  let p = document.createElement("p");
  p.classList.add("edge-weight");
  p.innerText = Math.round(len / 10);
  p.contentEditable = "true";
  p.inputMode = "numeric";
  p.addEventListener("blur", (e) => 
  {
    if (isNaN(Number(e.target.innerText))) 
    {
      alert("Lungime muchie invalidă");
      return;
    }
    n1 = Number(p.closest(".line").id.split("-")[1]);
    n2 = Number(p.closest(".line").id.split("-")[2]); 
    dist[n1][n2] = Number(e.target.innerText);
    dist[n2][n1] = Number(e.target.innerText);
  });

  line.style.transform = `rotate(${
    x1 > x2 ? Math.PI + Math.atan(slope) : Math.atan(slope)
  }rad)`;

  p.style.transform = `rotate(${
    x1 > x2 ? (Math.PI + Math.atan(slope)) * -1 : Math.atan(slope) * -1
  }rad)`;
  p.style.boxShadow = "0px 0px 3px 1px MediumSlateBlue";
  p.style.backgroundColor = "MediumSlateBlue"; 
  p.style.border = "20px MediumSlateBlue";
  p.style.borderRadius = "20px";
  line.append(p);
  Nodes.appendChild(line);
  document.getElementById(arr[0]).style.backgroundColor = "#333";
  document.getElementById(arr[1]).style.backgroundColor = "#333";
};
 
// funcție care obține coordonatele [x,y] a unui nod pe care s-a apăsat click
const drawUsingId = (ar) => 
{
  if (ar[0] === ar[1]) 
  {
    document.getElementById(arr[0]).style.backgroundColor = "#333";
    arr = [];
    return;
  }
  x1 = Number(document.getElementById(ar[0]).style.left.slice(0, -2));
  y1 = Number(document.getElementById(ar[0]).style.top.slice(0, -2));
  x2 = Number(document.getElementById(ar[1]).style.left.slice(0, -2));
  y2 = Number(document.getElementById(ar[1]).style.top.slice(0, -2));
  drawLine(x1, y1, x2, y2, ar);
};
 
// funcția care găsește drumul minim de la nodul sursă la restul nodurilor
const Dijkstra = (elem) => 
{
  let visited = [];
  let unvisited = [];
  clearScreen();

  let source = Number(elem.previousElementSibling.value);
  if (source >= cnt || isNaN(source)) {
    alert("Nod de start invalid");
    return;
  }
  document.getElementById(source).style.backgroundColor = "DarkSlateBlue"; 
  let parent = [];
  parent[source] = -1;
  visited = [];
  for (i = 0; i < cnt; i++) unvisited.push(i);
 
  // matrice ce conține costul de a ajunge la al i-lea nod de la nodul de start
  let cost = [];
  for (i = 0; i < cnt; i++) {
    i === source
      ? null
      : dist[source][i]
      ? (cost[i] = dist[source][i])
      : (cost[i] = Infinity);
  }
  cost[source] = 0;

  // matrice ce conține costul final minim
  let minCost = [];
  minCost[source] = 0;

  // repetă până când toate muchiile sunt vizitate
  while (unvisited.length) {
    let mini = cost.indexOf(Math.min(...cost)); 
    visited.push(mini);
    unvisited.splice(unvisited.indexOf(mini), 1);

    // muchii nevizitate
    for (j of unvisited) {
      if (j === mini) continue; 
      if (cost[j] > dist[mini][j] + cost[mini]) 
      {
        minCost[j] = dist[mini][j] + cost[mini];
        cost[j] = dist[mini][j] + cost[mini];
        parent[j] = mini;
      } 
      else 
      {
        minCost[j] = cost[j]; 
      }
    }
    cost[mini] = Infinity;
  }
  for (i = 0; i < cnt; i++)
    parent[i] === undefined ? (parent[i] = source) : null; 
  indicatePath(parent, source);
};

// drumul de la nodul de start la toate celelalte noduri
const indicatePath = async (parentArr, src) => 
{
  document.getElementsByClassName("path")[0].innerHTML = "";
  for (i = 0; i < cnt; i++) 
  {
    let p = document.createElement("p");
    p.innerText = "Nodul " + i + ": " + src;
    await printPath(parentArr, i, p);
  }
};

const printPath = async (parent, j, path_elem) => 
{
  if (parent[j] === -1) return;
  await printPath(parent, parent[j], path_elem);
  path_elem.innerText = path_elem.innerText + "-" + j;

  document.getElementsByClassName("path")[0].style.padding = "1rem";
  document.getElementsByClassName("path")[0].appendChild(path_elem);


  if (j < parent[j]) 
  {
    let tmp = document.getElementById(`line-${j}-${parent[j]}`);
    await culEdge(tmp);
  } 
  else 
  {
    let tmp = document.getElementById(`line-${parent[j]}-${j}`);
    await culEdge(tmp);
  }
};

const culEdge = async (el) => 
{
  if (el.style.backgroundColor !== "fuchsia") 
  {
    await wait(1000);
    el.style.backgroundColor = "fuchsia";
    el.style.height = "8px";
  }
};

const clearScreen = () => 
{
  document.getElementsByClassName("path")[0].innerHTML = "";
  let lines = document.getElementsByClassName("line");
  for (line of lines) 
  {
    line.style.backgroundColor = "#EEE";
    line.style.height = "5px";
  }
};

const resetDrawingArea = () => 
{
  Nodes.innerHTML = "";

  const p = document.createElement("p");
  p.classList.add("click-instruction");
  p.innerHTML = "Dă click pentru a adăuga un nod pe ecran";

  Nodes.appendChild(p);
  document.getElementById("add-edge-enable").disabled = false;
  document.querySelector(".reset-btn").disabled = true;
  document.getElementsByClassName("path")[0].innerHTML = "";

  cnt = 0;
  dist = [];
  addEdge = false;
};

const wait = async (t) => 
{
  let pr = new Promise((resolve, reject) => 
  {
    setTimeout(() => 
    {
      resolve("Gata! :)");
    }, t);
  });
  res = await pr;
};