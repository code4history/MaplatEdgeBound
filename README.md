# MaplatEdgebound

Maplat EdgeBound is a library for generating constrained triangulations based on [Delaunator](https://github.com/mapbox/delaunator).

日本語のREADMEは[こちら](./README.ja.md)

## Features

- Applies edge constraints to Delaunator output
- Supports multiple constraint types:
  - Required edge constraints (implemented in v0.1.0)
  - Forbidden edge constraints (planned for v0.3.0)
- Fast algorithm with efficient memory usage
- Implemented in TypeScript with complete type definitions

## Installation

### npm

```sh
# Install the main package
npm install @maplat/edgebound

# Install the required peer dependency
npm install delaunator
```

### Browser

```html
<script src="https://unpkg.com/@maplat/edgebound/dist/maplat_edgebound.umd.js"></script>
```

### Browser

Before installing Maplat EdgeBound, you need to load the following prerequisite library:

```html
<!-- Prerequisite library -->
<script src="https://unpkg.com/delaunator/delaunator.min.js"></script>


<!-- Then load Maplat EdgeBound -->
<script src="https://unpkg.com/@maplat/edgebound/dist/maplat_edgebound.umd.js"></script>
```

## Usage

### Required Edge Constraints (v0.1.0)

```typescript
import Delaunator from "delaunator";
import EdgeBound from "@maplat/edgebound";

// Define point data
const points = [[150, 50], [50, 200], [150, 350], [250, 200]];

// Generate initial triangulation using Delaunator
const del = Delaunator.from(points);

// Create constrained triangulation
const con = new EdgeBound(del);

// Add a required edge (e.g., connecting vertex 0 and vertex 2)
con.constrainOne(0, 2);

// Add multiple required edges at once
const edges = [[0, 1], [1, 2], [2, 3]];
con.constrainAll(edges);

// The constrained triangulation result is available in the del property
const constrainedDel = con.del;
```

#### Constraints

Input data must satisfy the following conditions:

- No duplicate coordinates in the point set
- No intersections between constraint edges
- Constraint edges must not intersect with points other than their endpoints
- The outer boundary of the triangulation must form a convex hull
- The triangulation must not contain holes

The last two conditions are guaranteed by Delaunator, but care must be taken when modifying the triangulation.

#### Algorithm

Basic approach:

- First, construct a regular Delaunay triangulation (using Delaunator)
- Process and add the specified constraint edges
- Detect and remove existing edges that intersect with constraint edges
- Optimize to satisfy the Delaunay condition as much as possible while maintaining constraint edges

This algorithm is based on the following paper:

- [A fast algorithm for generating constrained Delaunay triangulations, 1992, S. W. Sloan](https://web.archive.org/web/20210506140628if_/https://www.newcastle.edu.au/__data/assets/pdf_file/0019/22519/23_A-fast-algortithm-for-generating-constrained-Delaunay-triangulations.pdf)

#### Performance

- Achieves near-linear execution time O(N) for N points
- Efficient memory usage through BitSet implementation
- Additional cost for constraints typically less than 10%

### Future Extensions (v0.3.0)

```typescript
import Delaunator from "delaunator";
import {Forbid} from "@maplat/edgebound";

const del = Delaunator.from(points);
const fbd = new Forbid(del);
fbd.forbidAll(forbidEdges);  // Define forbidden edges
const forbidDel = fbd.del;   // Get constrained triangulation result
```

## License

MIT License

Copyright (c) 2024 Code for History

### Developers

- Kohei Otsuka
- Code for History

### Credits

- This library is based on [@kninnug/constrainautor 4.0.0](https://github.com/kninnug/Constrainautor/)
- The constraint algorithm is based on S. W. Sloan's paper
- Uses [robust-predicates](https://github.com/mourner/robust-predicates) (a port of Jonathan Shewchuk's geometric computation algorithms)

We welcome your contributions! Feel free to submit [issues and pull requests](https://github.com/code4history/MaplatEdgebound/issues).



