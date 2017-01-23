# CTAT-detector-plugins

**CTAT main repository**
https://github.com/CMUCTAT/CTAT

**Coming soon:** 

[link to documentation and resources for extended CTAT tools: build your own detectors]

**Coming at some point... perhaps?**

Workshop (or similar event) to researcher-source CTAT detectors (and cool applications of detectors)
^ Similar to the LearnSphere workshop last year
[EDM folk, in particular: "You may find that skills you've developed for writing **offline analyses of log data** translate quite well to writing **online detectors** for use with CTAT tutors and TutorShop"]
[FWIW: the EDM workshop proposal deadline is **February 21st, 2017**]

**Current examples:**
- **error categorizer:** 
	- Description: keeps a count of student errors, categorized under a particular canonicalization scheme
	- Outputs: mapping from observed student error categories to
		- running, per-student count of observations
		- raw examples (i.e., non-canonicalized)
	- Potential extensions: 
		- Recency (i.e., decay function)
		- associate every update from an **error categorizer** with a reference to the particular problem instance (I believe this is already included on TutorShop's end)
	- Current canonicalization schemes include:
		- Simple canonicalization: line-to-line transition representation
			- **Example 1**
				- input:   x + 6 = 15   ->   x + 6 - 6 = 15
				- output:
			- **Example 2**
				- input:   x + 6 = 15 -> 6 = 15
				- output:
			- **Example 3**
				- input:    x + 6 = 15 -> x = 15 + 6
				- output:
			
		- Simple canonicalization: track changes
			- ![example](https://raw.githubusercontent.com/d19fe8/CTAT-detector-plugins/master/Screen%20Shot%202017-01-22%20at%204.14.46%20PM.png)
			- ![example](https://raw.githubusercontent.com/d19fe8/CTAT-detector-plugins/master/Screen%20Shot%202017-01-22%20at%204.18.39%20PM.png)
			- ![example](https://raw.githubusercontent.com/d19fe8/CTAT-detector-plugins/master/Screen%20Shot%202017-01-22%20at%204.23.10%20PM.png)
			
			- **Example 1**
				- input:   x + 6 = 15   ->   x + 6 - 6 = 15
				- output:
			- **Example 2**
				- input:   x + 6 = 15 -> 6 = 15 
				- output:
			- **Example 3**
				- input:  
				- output:
			
		- Change-based canonicalization: an extra layer over "track changes", which shows **only what changes between two lines in Lynnette** (and thus produces **fewer** categories, more focused on abstract **transformations**)
		
			- ![example](https://raw.githubusercontent.com/d19fe8/CTAT-detector-plugins/master/Screen%20Shot%202017-01-22%20at%204.24.00%20PM.png)
		
			- **Example 1**
				- input:   x + 6 = 15   ->   x + 6 - 6 = 15
				- output:  ... - a = ...
			- **Example 2**
				- input:   x + 6 = 15 -> 6 = 15
				- output:  [x] ... = ...
			- **Example 3**
				- input:    x + 6 + 3 = 15 -> x + 3 = 15 + 6
				- output:   ... [+ 6] ... = ... + 6
			- **Example 4**
				- input:    x + 6 + 3 - 2 = 15 -> x + 6 + 3 - 2 = 15 + 6
				- output:   ... [+ 6] ... = ... + 6
			
	- In-development canonicalization schemes include:
		- Labeled error categories (verbal category descriptions, which DO NOT infer underlying misconceptions)
			- **Example 1**
				- input:  
				- output:
			- **Example 2**
				- input:  
				- output:
			- **Example 3**
				- input:  
				- output:
		- Inferred misconceptions (verbal category descriptions, which DO infer underlying misconceptions)
			- **Example 1**
				- input:  
				- output:
			- **Example 2**
				- input:  
				- output:
			- **Example 3**
				- input:  
				- output:
			
	- Don't like any of the above canonicalization schemes? Please contribute to this collection by creating your own canonicalization function, and feel free to use one of our examples as a guiding template.
	
- **help-seeking models**
	- Current help-seeking models include
		- ...
		- ...
		
	- In-development help-seeking models include

- **current-step error count**

- **stagnation**



**In-development:**
- **BKT**
	- at least one variant of BKT and at least one BKT-driven detector
		- predictive stability
		- possibly: BKT + contextual guess and slip --> Arroyo et al., carelessness detector
- **a cognitive gaming detector**
  
- at least one detector of a student's affective state (boredom detector tends to have higher accuracy than other affect detectors)
