---
title: "Labour Market Landscape for Economics Graduates in Canada"
excerpt: "The 'Labour Market Landscape for Economics Graduates in Canada' project provides an in-depth analysis of job market trends, skill requirements, and regional variations for economics graduates, utilizing Web Scraping, advanced data analysis and network metrics.<br/><img src='/images/Canada1.png'>"
collection: portfolio
---


The study, titled "Labour Market Landscape for Economics Graduates in Canada," investigates the demand for economics-related job skills across different Canadian provinces. The research uses a comprehensive dataset of job listings sourced from Indeed.ca, focusing on positions requiring economics degrees or relevant qualifications.

## Methodology

The methodology comprises several key steps: data collection, cleaning and segregating job descriptions, extracting relevant information for each study variable, and analyzing the data. Each step is detailed below.

### Data Collection

The data collection process aimed to gather job listings from Indeed.ca using "Economics" as the keyword and specifying "Canada" as the location. This was carried out in three main steps, utilizing a custom Python script executed on Google Cloud Notebook on January 15, 2024.

#### Step 1: Initial Job Listing Extraction

A custom Python script was developed to scrape job listings from Indeed.ca. The script used BeautifulSoup for web scraping and integrated the Scrapingdog API to efficiently extract details such as job titles, company names, locations, and hyperlinks to full job descriptions.

However, specific posting or expiration dates were not available for all listings. To address this, we used the page number as a proxy for the relative recency of the posting compared to our search date. All collected data was saved in a JSON file for further analysis.

During the extraction process, it was noted that not all job listings from each page (which typically displays up to 15 jobs) were consistently retrieved in every script run. This variability, where job data was intermittently missing across different runs, was not consistent and appeared to occur randomly. Possible reasons for this variability include intermittent API limitations, network fluctuations, or changes in webpage structure.

#### Step 2: Job Description Extraction

In the next phase, the script focused on retrieving comprehensive job descriptions for the previously identified job listings by accessing the hyperlinks collected during the initial extraction phase. A total of 996 job descriptions were sourced from listings across the most recent 69 pages, close to the date of retrieval.

### Cleaning Data and Segregation

The data cleaning process involved eliminating duplicates, resulting in 606 unique job listings. Among these, 134 were in French and 5 were in Spanish, which were translated using OpenAI. The translation results were carefully reviewed, and any minor errors were corrected manually. For job listings where information was not fully extracted during the web crawling step, the missing data was retrieved from the job descriptions. 

Subsequently, each job description was segregated into sections: location, required academic degree, years of experience, and job requirements. The location of each job was identified by parsing the job descriptions and extracting lines containing location information. A comprehensive list of provinces and cities within Canada was compiled using tokenization, stop word removal, and unigram analysis. Keyword extraction was used to assign the city and province to each job listing. Two job listings were excluded as their indicated locations were outside Canada.

The required degree for each job listing was extracted by scanning for keywords related to degrees, such as "degree" and "Ph.D. in." The line containing one of these degree-related keywords along with the words "economics" or "economy" was identified as the degree requirement. As a result, 79 job listings were removed because they required an academic degree other than Economics or did not specify the required degree, primarily academic positions. Additionally, 6 listings related to academic positions (professorships and faculty members) were omitted from the dataset. This focused the dataset on non-academic jobs, leaving a total of 525 observations for further analysis.

The final stage of data cleaning involved extracting competencies and requirements. Experience requirements were identified by searching for lines containing both "year" and "experience." The job requirements section was isolated using a set of keywords, typically starting after phrases such as 'qualifications,' 'your role,' or 'your profile,' and ending before phrases such as 'our offer' or 'what we offer.'

### Preprocessing: Keyword Extraction

During this phase of data preprocessing, information was extracted for each entry from its corresponding section. The information for each variable of study was collected as follows:

1) **Identification of Programme and Degree Required**

The primary objective was to identify keywords pertaining to academic programs and degree levels as distinct entities. Various techniques such as lemmatization, stop word removal, and the utilization of unigrams, bigrams, and trigrams were employed to achieve this objective. This stage involved grouping synonyms and words with similar components into unified entities. For example, regarding education level, variations such as 'phd', 'ph.ds', 'ph.d', 'doctorate', 'ph.d.', and 'phd.' were normalized as 'ph.d.'. Similarly, for academic programs, terms like "math" and "mathematics" were harmonized across all job descriptions.

Programs were categorized based on their respective disciplines to facilitate a better understanding of the subject matter. A Python dictionary was created, associating categories with terms representing academic programs within disciplines (e.g., Business Management, Economics, Finance, etc.).

2) **Identification of Job Location**

From the location section, three variables were extracted: city, province, and job type. The job type indicates whether the job is onsite, hybrid, remote, or both hybrid and remote. A keyword extraction technique was employed to search for the presence of the words "hybrid" and "remote" in the job description. If these words were absent, the job was categorized as onsite.

3) **Skills Sets and Competencies**

The extracted experience line from the previous step was utilized to establish the minimum years of experience variable. A Python script was employed to identify the smallest number of years of experience and assign it as the value for this variable.

To classify the required skills and competencies, predefined dictionaries with relevant categories and terms were created. Keyword extraction techniques were then applied to the job requirements section to identify the specific skills needed for each job listing. These dictionaries were expanded based on the framework introduced by Matturro et al. (2019) for soft skills and Verma et al. (2019) for technical skills.

Each job listing was assigned the relevant soft skills and technical skills based on the extracted keywords.

### Data Analysis

Data analysis encompassed a range of techniques, including visualization techniques, network analysis, and centrality metrics, which were crucial for understanding the job market for economics graduates.

**Centrality Metrics:**
- **Degree Centrality:** Measures the number of direct connections a skill has with other skills, indicating how frequently it appears in job listings.
- **Betweenness Centrality:** Evaluates how often a skill serves as an intermediary between other skills.
- **Closeness Centrality:** Assesses how quickly a skill can connect with other skills across the network.

Additionally, the analysis focused on job postings from provinces with more than 10 observations to explore regional differences. Chi-square and Fisher’s exact tests were utilized to identify significant variations in the demand for soft skills across different provinces. Contingency tables were used to provide a detailed view of skill distribution and better understand regional variations.

### Tools Used

Python was the primary tool used for data analysis, while Excel and Photoshop were employed to enhance efficiency for specific tasks.




---

## Figures

<img src="/images/Canada/Picture1.jpg" alt="">
**Figure 1.** Number and types of jobs in Canadian Provinces. 
The center heat map represents the number of jobs in each province. The top-right corner pie chart represents the percentage and number of jobs by types: onsite, remote, hybrid. The pie charts around the heat map represent the distribution of job types (onsite, remote, hybrid) within each province. The bottom-left pie chart shows the number of jobs with remote location specified, along with their distribution by type (remote, hybrid, remote and hybird)



 **Figure 2.** Top 10 Cities with the highest number of jobs for Economics graduates.



**Figure 3.** Network Analysis of Degrees (closet programmes )

<img src="/images/Canada/Disciplines.png" alt="">

**Figure 4.** Network Analysis of Disciplines


**Figure 5.** Degree Requirements for Job Listings


**Figure 6.** Minimum Years of Experience Required for Job Listings

<img src="/images/Canada/Picture3.png" alt="">

**Figure 7.** Network Analysis of Soft Skills


**Figure 8.** Network Analysis of Technical Skills

<img src="/images/Canada1.png" alt="">
**Figure 9.** Most requested softwares and platforms

# Citation

**Suggested Citation**:	Samandar Ali Eshtehardi, M., Labour Market Landscape for Economics Graduates in Canada, Canadian Public Policy, Forthcomming March 2024.
