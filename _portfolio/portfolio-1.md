---
title: "Grassroot Innovation Analysis"
excerpt: "Grassroot innovation analysis involves evaluating locally-driven, community-based solutions to identify innovative practices, technologies, or strategies that address specific social or economic challenges at the grassroots level.<br/><img src='/images/MCA.png'>"
collection: portfolio
---



# Project Overview 

In this project, I explored grassroots innovation data using Multiple Correspondence Analysis (MCA) to identify key patterns across various categories, such as demographics, career paths, and urban vs. rural innovation contexts. This project involved several steps in data preprocessing, analysis, and visualization that culminated in a published study.

# Data Preparation and Analysis
The dataset included categorical variables representing different aspects of grassroots innovators. I used **Excel** for preliminary data cleaning and exploratory visualization, which helped me get an initial sense of the data. To handle this data effectively:

1. **Data Cleaning**: Rows with missing values were removed in Excel to ensure a balanced dataset.
2. **Variable Transformation**: Categorical variables were transformed into factors in **R Studio**, enabling them to be analyzed with MCA.

# MCA Implementation

The MCA was conducted in **R Studio** using the FactoMineR and factoextra libraries. This technique helped us reduce the data’s dimensionality, capturing the most significant relationships among the variables:

* **Optimal Dimensions**: An eigenvalue scree plot was generated in R to determine the optimal number of dimensions, ensuring the analysis retained the most variance.
Variance Explained: The selected dimensions captured significant variance, allowing us to interpret the positions of categories and individuals in a reduced space.

# Visualizations

Using **ggplot2** and **factoextra** in R Studio, I generated visualizations to display the analysis results effectively:

* **Variable Factor Map**: The MCA factor map (see figure below) illustrates the relationships among variables. Categories with similar response patterns are located closer together, suggesting potential clusters or groupings of grassroots innovators.

Contribution Plot: Additional visualizations displayed the contribution of each variable to the MCA dimensions, which helped to identify the most influential categories in the dataset.

Clustering Analysis: K-means clustering was performed on the MCA output to group similar observations. I used the Elbow, Silhouette, and Gap Statistic methods to identify the optimal number of clusters. The final cluster plot (see figure) reveals clear groups within the data, with ellipses representing confidence intervals around each cluster, providing insights into distinct types of grassroots innovators.

# Technical Challenges and Solutions

Implementing the MCA required careful selection of variables and interpretation of dimensions. For example, identifying statistically significant categories and investigating R-squared values for each category ensured robustness in the analysis. Additionally, the clustering results were overlaid on the MCA plot using the **ggplot2** library’s advanced features in R, creating an intuitive visualization that highlighted key insights.

# Results
This analysis revealed distinct clusters among grassroots innovators, categorized by factors such as career background and innovation field. The findings provide valuable insights into how these clusters vary by region and demographics, contributing to targeted policy suggestions aimed at supporting innovation in diverse contexts.



# Images:

<img src="/images/grassrootImage/1_GrassrootsInnovatros.png" alt="Figure 1: The distribution of grassroots innovations by grassroots innovators">

Figure 1. The distribution of grassroots innovations by grassroots innovators


<img src="/images/grassrootImage/2_LOCATION.png.png" alt="">
Figure 2. The distribution of grassroot innovators across Iranian provice and rural/urban area by gender. Dark collars indicate male and modest brith collors indicate female, very light collors indicate unspecified. Green and blue indicate rural and urban area, respectivley. 

<img src="/images/grassrootImage/3_1_AgeGroup.png.png" alt="">
<img src="/images/grassrootImage/3_2_EDUCATION.png.png" alt="">
<img src="/images/grassrootImage/3_3_Occupation.png" alt="">
Figure 3. Education level, age group composition, and Occupation of the grassroots innovators (ISCO_08)

<img src="/images/grassrootImage/4_IPC.png" alt="">
Figure 4. Technological fields of grassroots innovations

<img src="/images/grassrootImage/5_1_Scree plot.png" alt="">
Figure 5. Scree plot of eigenvalues against the number of dimensions

<img src="/images/grassrootImage/6_NbClust.png" alt="">
Figure 6. Consensus on optimal number of clusters obtained from NbClust package


<img src="/images/grassrootImage/7_MCA.png" alt="">
Figure 7. Map of perception linked to the grassroots innovators’ and innovations’ characteristics
Variable categories are presented according to guide color on the right side; the gray points represent observations. The density curves illustrates zones that are highly concentrated. The 3 clusters are depicted by Ellipses (Left figure). MCA plot for the variables (left Figure) and categieries of varibles (right figure)



# Apendix 

<img src="/images/grassrootImage/A_1_.png" alt="">

Figure A.1. Visualizing The coordinate of Variables on  the first two dimensions.
Identifying of variables shaping the multivariate structure of the dataset, Figure A.1. visualizes the correlation between variables and MCA principal dimensions (the coordinates are the squared correlations between variables and the dimensions). It can be seen that variable gender is the most correlated with dimension 1. Similarly, variable IPC is most correlation with dimension 2. With other words, on the first axis the individuals are separated according to gender and on the second axis according to IPC. Moreover, variables Education, Age and Career are better variables to explain oppositions between individuals on the first and second axes. (The table of correlation of variables and the fine dimensions is presented in Appendix 2.

<img src="/images/grassrootImage/A_2_confidence plot.png" alt="">
Figure A.2. MCA factor map on the first two dimetions

<img src="/images/grassrootImage/A.3.Clustree.png" alt="A.3.">
Figure A.3. Clustree Visualization
I used the clustree package in R to visualize how samples shift between clusters as the number of clusters increases. This approach is useful for identifying which clusters are distinct and which are unstable. While it doesn't explicitly determine the optimal number of clusters, based on the diagram above, four clusters are suggested, as this grouping provides a balance between distinctiveness and stability.

# Citation
**Suggested Citation**: Ghadimi, A., Samnadar Ali Eshtehardi, M., Saviz, M., Mahdad, M., (2023) Grassroots Innovations and innovators: the case of Iran, Journal of Innovation and Development, 1-24. DOI: [https://doi.org/10.1080/2157930X.2023.2233208](https://doi.org/10.1080/2157930X.2023.2233208)

