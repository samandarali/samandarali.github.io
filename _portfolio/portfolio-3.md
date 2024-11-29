---
title: "MyScientometrics"
excerpt: "It is a R shiny app that ease biblometrics and scientometrics analysis <br/><img src='/images/myscientometricsApp.png'>"
collection: portfolio
---







You can access to the application [here](https://mojgansamandar.shinyapps.io/MyScientometrics05/)

This appuses bibometrics library. you can have access to the code [here](https://github.com/samandarali/MyScientometrics03)

# Purpose: 

Embarking on an academic research project requires a thorough understanding of the current state of research on the chosen topic. Researchers must ask themselves a series of questions, including whether the topic has been extensively studied by other scholars, who the experts in the field are, which journals are most likely to publish relevant research, whether the topic falls under the umbrella of a specific discipline or is multidisciplinary, whether the topic is relevant globally or limited to certain regions, and what related issues are worth exploring. These questions must be answered to avoid duplicating previous research or missing out on significant developments in the field.
Scientometrics and bibliometrics are powerful tools that can provide valuable insights into existing literature and identify key authors, journals, and topics. However, using these tools often requires specialized software or programming skills, which can be a significant barrier for researchers and decision-makers who lack coding knowledge.
The MyScientometrics app aims to provide researchers and practitioners with an easy-to-use tool for bibliometric analysis that requires minimal time and effort. The app allows users to identify trends, evaluate the impact of specific authors, institutions, or countries, and compare research output across different fields or disciplines. By automating the process of bibliometric analysis and providing easy-to-interpret visualizations, MyScientometrics can help researchers and practitioners gain a better understanding of scientific literature and make informed decisions and get a quick overview or glimpse of the field.
The upcoming sections will cover the topics of scientometrics and bibliometrics analysis, highlighting the benefits of using MyScientometrics as opposed to other tools, as well as the potential achievements users can attain through the MyScientometrics app. We will also examine the functioning of the app and its limitations. Finally, the last section will provide a conclusion.


# Instructions for Operation:

To use MyScientometrics (link to the app is https://samandarali.shinyapps.io/MyScientometrics3/), users need to upload a plain text file from Web of Science. Once the file is uploaded, the app automatically performs a bibliometric analysis using the bibliometrix package in R. The analysis may take several minutes to complete, and the user is advised not to close or refresh the page until it is finished. Once complete, the results of the analysis are displayed in the main panel of the app. The user can choose the visualization type from the dropdown menu to view the corresponding visualization. In summary, MyScientometrics is a user-friendly and effective tool for bibliometric analysis that can provide valuable insights into scholarly research trends.
Therefore, the only part that required time is to get the data from Web of Science. For those who are not familiar with this process, to download data from Web of Science in plain text format, follow these steps:
1)	Create a query that includes all the articles you intend to analyze and excludes those that are not relevant. For example, the query used in the sample file (attached) is TS= ("entrepreneurial ecosystem*" OR "innovation ecosystem*"). This query lists all scientific publications whose title, abstract, or keywords contain either "entrepreneurial ecosystem" or "innovation ecosystem". For more information on advanced searching techniques, please visit the Advanced Searching Techniques page. Retrieve data by entering the query and clicking on the search button.
2)	The list of articles will be presented on Web of Science. To retrieve the list, click on the "Export" button and choose "Plain Text File" from the popup list. You need to choose “full Record and Cited References” from the list under Record Content. The maximum number of articles that can be downloaded at once is 500. If the output contains more than 500 articles, they need to be downloaded separately, e.g., (1-500), (501-1000), etc. 


  <img src='/images/MyScientometrics/WOS1.png'>
  <img src='/images/MyScientometrics/WOS2.png'>
  <img src='/images/MyScientometrics/WOS3.png'>


3)	Merge the data by copying and pasting the contents of each downloaded file into a new file, one after the other. Once the files are merged, the resulting file can be uploaded to MyScientometrics for analysis.


You can click on Use Sample Dataset for loading the analysis for a sample data.


## citation:

 Aria, M. & Cuccurullo, C. (2017) bibliometrix: An R-tool for comprehensive science mapping analysis, Journal of Informetrics, 11(4), pp 959-975, Elsevier.

