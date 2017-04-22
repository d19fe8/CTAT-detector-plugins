# CTAT-detector-plugins
________________________________

## Table of Contents  
[Upcoming features](#upcoming) <br/> 

**Detectors:** <br/> 
- [Most stable detectors](#moststable) <br/> 
- [In-development](#indevelopment) <br/> 
- [Detector wishlist](#wishlist)

<a name="ctatmain"></a> <a name="upcoming"></a> <a name="moststable"></a> <a name="indevelopment"></a> <a name="howtotest"></a> <a name="wishlist"></a>

**Note:** in general, detectors in this repository are currently still under development! Detectors that are currently most stable are listed under: [Most stable detectors](#moststable) <br/>

_______________________________

**New here? Try building your own real-time dashboard using this guide:** https://docs.google.com/document/d/1irGzgmuuHgFhWENgWAdYaXeMdWN3MnzVe4dy6d3Gkyk/edit?usp=sharing]
_______________________________

## Upcoming features

- **Integrated detector development and testing tools**

## Recently added features

- **A cure for detector amnesia: Working initialization of detectors from TutorShop**

- **AggHouse: aggregator API**

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

## Most stable detectors

- **current-step error count**
	- Description: keeps a running count of attempts on each step in an interface
	- Outputs: the running count of attempts on **the most recent step the student has worked on** (e.g., if a student has tried 30 times on a particular interface element, the output will be "30")

- **stagnation**
	- Description: outputs alerts in response to fixed, user-specified thresholds on student idle time
	- Outputs: custom message after each specified time-interval (e.g., "idle for more than 30 seconds", "idle for more than 1 minute", "idle for more than 2 minutes")

________________________________

## In-development detectors

- **error categorizers**
[Documentation](https://github.com/d19fe8/CTAT-detector-plugins/tree/master/HTML/Assets/Detectors/error_categorizers)

- **BKT models**
[Documentation](https://github.com/d19fe8/CTAT-detector-plugins/tree/master/HTML/Assets/Detectors/bkt_models)

- **help-seeking models**
[Documentation](https://github.com/d19fe8/CTAT-detector-plugins/tree/master/HTML/Assets/Detectors/help_models)
________________________________

## Detector wishlist
	
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
  
- at least one detector of a student's **affective state**: 
	- (boredom detector tends to have higher accuracy than other affect detectors)
		- Description:
		- Outputs:

_______________________
<!--		
## How to test in running tutors

 To activate this feature, first provide an initialization parameter
 '''process_transactions_url''' whose value is the TutorShop URL for
 transactions to be sent to the server. Optionally, provide also  ausk

 Second, hard-code the mail-worker.js URL and the detectors' URLs, each
 relative to the HTML/Assets/ folder, in '''transaction_mailer_users.js''',
 which defines a global object TransactionMailerUsers, and include this .js
 file in your .html. E.g., in
 
 ```html
<head>
    ...
    <script
        src="https://cdn.ctat.cs.cmu.edu/releases/latest/ctatloader.js"></script>
    <script src="Assets/transaction_mailer_users.js"></script>'''
</head>
```

 Design: if the process_transactions_url parameter is set, then new class
 CTATTransactionListener looks for an object TransactionMailerUsers and
 calls TransactionMailerUsers.create(). This object is defined in
 transaction_mailer_users.js, which should be included via a \<script> tag
 in the html for a tutor that wants to use transaction forwarding or
 detectors.

 The code in TransactionMailerUsers instantiates and starts the mail-worker
 and detectors from URLs hard-coded in it. Arguments to
 TransactionMailerUsers.create() pass to the mail-worker the
 process_transaction_url and process_detectors_url as well as an
 authenticity_token needed for each POST to Rails.

 CTATTransactionListener then receives messages as a CommShell event
 listener and forwards student actions and TPAs to the mail-worker and to
 any detectors TransactionMailerUsers.sendTransaction(). For transactions
 that have a tutor response, both tool and tutor data are sent in a single
 transaction message.

_______________________

--->
