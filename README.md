CN-Clustering-Algorithm
=======================

JS implementation of a non-classified point clustering algorithm I wrote. See cn_clustering.js

This algorithm runs asymptotically in O(nlogn) time, which is significantly faster than the normal K-means clustering, which is NP-Hard.


The following is an example implementation which clusters RGB values to find the dominant color range in an image. It can be found in the example folder. Note that it will take a few seconds to run because I didn't feel like making an octree for finding nearest neighbors in 3-dimensions (aka it is taking n^2 time). The normal algorithm uses a quadtree, and will run in O(nlogn).

![](https://s3-us-west-2.amazonaws.com/sdrobs/download1.png)
