# CTAT-detector-plugins

**CTAT main repository**

https://github.com/CMUCTAT/CTAT

**General features: coming soon / in development**

- **the detector development and testing tools (...placeholder until we have a better/shorter name for this :) )**
<!---
	- **Motivation:** 
		- In the absence of strong pre-existing theory, specified at a fairly fine-grained level, it can be difficult to know how best to design **effective micro-interventions** in an ITS (e.g., **how** should a tutor adapt at the step-level, and **in response to what?**)  or teacher-facing analytics displays that could **support effective teacher-led micro-interventions**. 
		- ITS detectors are commonly **developed** using log data (e.g., GIFT's authoring tools explicitly support data-driven detector development, using log data) and/or **evaluated** using log data (e.g., under the "discovery with models" approach, correlations may be assessed between a detector's output and the output of other detectors, posttests, or external measures of student performance and learning behaviors).
		
	- In order to design **effective** analytics-driven ITSs and dashboards, we must strive to evaluate, as directly as possible:
		- the **expected causal impact** of a particular micro-intervention (and the usefulness of a **particular** set of analytics/detectors/measures in informing the relevant decision-makers of true **opportunities for intervention**
		- the **expected usability** of analytics, when embedded in particular systems, for use in particular contexts, by members of a particular user population
		
	- **Features:** 
		- Make use of both built-in and custom methods, to use historical data from intelligent tutoring systems (accepts DataShop export formats) in order to **estimate** the relative **causal impact** of…
			- different student behaviors/states on learning
			- potential interventions on these student behaviors/states
			- ...
			
		- Methods to evaluate usability
			- Teacher-level (e.g., for a next-day use dashboard or reporting system)
				- ...
			- Classroom-level (e.g., for real-time teacher or peer-tutoring support tools)
				- ...
			- Student-level (e.g., for use in a student dashboard, or in driving ITS adaptivity)
				- ...
--->
________________________________

**Current examples: thoroughly tested and validated**

- **current-step error count**
	- Description: keeps a running count of attempts on each step in an interface
	- Outputs: the running count of attempts on **the most recent step the student has worked on** (e.g., if a student has tried 30 times on a particular interface element, the output will be "30")

- **stagnation**
	- Description: outputs alerts after 
	- Outputs: custom message after each specified time-interval (e.g., "idle for more than 30 seconds", "idle for more than 1 minute", "idle for more than 2 minutes")

________________________________

**Current examples (still in development!)**

- **Bayesian Knowledge Tracing (BKT)**
	- **Standard BKT**
		- Description:
		- Outputs:
	- Variant 1
		- Description:
		- Outputs:
	- Variant 2
		- Description:
		- Outputs:
	...

- **help-seeking models**
	- Current help-seeking models include
		1. **Original help-seeking model**: explicitly diagnose not only when an action is **[preferred / acceptable / not acceptable / ask teacher for help]** but also when it is **[help abuse / help avoidance]**
			- Description:
			- Outputs: "\<action evaluation>/\<action type>" (e.g., "preferred/try step" or "not acceptable/help avoidance")
		2. **New** variant on help-seeking model: expanded considerations of **when to ask for help from teacher** (representing various hypotheses of when teacher help might be most effective)
			- Variant 1
				- Description:
				- Outputs:
			- Variant 2
				- Description:
				- Outputs:
			- ...
		3. **New** variants help-seeking model: **modifications based on recent "Help Helps" paper**
			- Try step is preferred for low-skill steps (re: Ido, 2014)
				- Variant 1.1
					- Description:
					- Outputs:
				- Variant 1.2
					- Description:
					- Outputs:
					- Validation:
			- Variant 2
				- Variant 2.1
					- Description:
					- Outputs:
					- Validation:
				- Variant 2.2
					- Description:
					- Outputs:
					- Validation:
			- Variant 3
				- Description:
				- Outputs:
			- ...
		- ...
		
		- Validation: these model variants were compared on \<dataset_names> using \<local-quantitative / pre-post-quantitative / usablity studies>, with results shown in the following table:
		\<insert table>

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
				- output:  x + a = b    ->   x + a - a = b
			- **Example 2**
				- input:   x + 6 = 15 -> 6 = 15
				- output:  x + a = b  -> a = b
			- **Example 3**
				- input:    x + 6 = 15 -> x = 15 + 6
				- output:   x + a = b  -> x = b + a
			
		- Simple canonicalization: track changes
			- ![example](https://raw.githubusercontent.com/d19fe8/CTAT-detector-plugins/master/Screen%20Shot%202017-01-22%20at%204.14.46%20PM.png)
			- ![example](https://raw.githubusercontent.com/d19fe8/CTAT-detector-plugins/master/Screen%20Shot%202017-01-22%20at%204.18.39%20PM.png)
			- ![example](https://raw.githubusercontent.com/d19fe8/CTAT-detector-plugins/master/Screen%20Shot%202017-01-22%20at%204.23.10%20PM.png)
			
			- **Example 1**
				- input:   x + 6 = 15   ->   x + 6 - 6 = 15
				- output:  x + a **- a** = b
			- **Example 2**
				- input:   x + 6 = 15 -> 6 = 15 
				- output:  **[x +]** a = b
			- **Example 3**
				- input:   x + 6 = 15 -> x = 15 + 6
				- output:  x **[+ 6]** = 15 **+ 6**
			
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
			- Misconception labeling scheme 1
				- **Example 1**
					- input:  
					- output:
				- **Example 2**
					- input:  
					- output:
				- **Example 3**
					- input:  
					- output:
			- Misconception labeling scheme 2
				- **Example 1**
					- input:  
					- output:
				- **Example 2**
					- input:  
					- output:
				- **Example 3**
					- input:  
					- output:
			- Misconception labeling scheme 3
				- **Example 1**
					- input:  
					- output:
				- **Example 2**
					- input:  
					- output:
				- **Example 3**
					- input:  
					- output:
			- ....
			
	- Don't like any of the above canonicalization schemes (and/or misconception labeling schemes)? Please contribute to this collection by creating your own canonicalization function, and feel free to use one of our examples as a guiding template.


________________________________

**In-development:**
	
- at least one variant of BKT and at least one BKT-driven detector
	- predictive stability
		- Description:
		- Outputs:
	- possibly: BKT + contextual guess and slip --> Arroyo et al., carelessness detector
		- Description:
		- Outputs:

- **Simple wheel-spinning detectors**
	- ...
		- Description:
		- Outputs:
	- ...

- **a cognitive gaming detector**
	- ...
		- Description:
		- Outputs:

________________________________

**For the future:**
  
- at least one detector of a student's **affective state**: 
	- (boredom detector tends to have higher accuracy than other affect detectors)
		- Description:
		- Outputs:
