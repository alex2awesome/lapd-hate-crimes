# lapd-hate-crimes

Project Name: "If it Bleeds, it Leads": A Computational Approach to Covering Crime in Los Angeles
- Divya Choudhary and Alex Spangher

Project Abstract:
 Developing and improving computational approaches to covering news can increase journalistic output and improve the way stories are covered. In this work we approach the problem of covering crime stories in Los Angeles. We present a machine-in-the-loop system that covers individual crimes by (1) learning the prototypical coverage archetypes from classical news articles on crime to learn their structure and (2) using output from the Los Angeles Police department to generate "lede paragraphs", first structural unit of crime-articles. We introduce a rule-based system for generating ledes and a probabilistic graphical model for recommending follow-on paragraph types, showing how the two can be used together to form the skeletons of news articles covering crime.

# Directory Structure

This repository includes:
1. Data (directory: `data`)
2. Notebooks for Analysis of 'Lede Paragraph generation' (directory: `notebooks`)
3. Topic Model containing code for 'Learning the news article structure' (directory: `topic_model`)

Data contains all LAPD crime data and Crosstwon ground truth lede paragraphs (`data/merged_records_df.csv`), and LAPD Crime Codes (`data/CCADMANUAL 2019 040319 - excl. SAR codes.pdf`).

These are referred across `.py` files in noteboks and topic model folder.

# Running The Code:

### Topic Modeling

For the first part of our proposed solution, run `topic_model/sampler.py`. To run the topic model, run the following steps:
* create a directory `tm_data` in the `topic_model` folder
* download the following files: `https://drive.google.com/file/d/1Z74cJRJ_KWrZnb1f69IX8efOBfrjQHdq/view?usp=sharing`, `https://drive.google.com/file/d/1zDSl_cghbyNWIopKLRcQq6po13U9eS3f/view?usp=sharing` and place them in this directory
* run the following command: ``python3 sampler.py -i data -o output -t 1000``

Please contact the authors if you have any questions.

To process additional data, refer to notebook: `notebooks/process-data-for-topic-model.ipynb`

### Lede Paragraph Generation

For the second part of our proposed solution, insights can be obtained by running `notebooks`. 
* `match-records-and-generate-template.ipynb` is generating template for crime types
* `cluster_paragraphs.ipynb` is used to cluster different crime codes
* Note that this step involves manual process as well
