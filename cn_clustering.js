//assuming points entered as array of 2 element arrays (eg. [[1,2],[5,6]])

function cn(points, clusterCount){ //clusterCount is the number of clusters to restrict the plot to
    var closestPoint = []

    for (var i = 0; i < points.length; i++){
        var x = points[i][0]
        var y = points[i][1]

        var leastDist = -1 //invalid default
        var point = -1

        for(var j = 0; j < points.length; j++){
            if(i == j)
                continue

            var x1 = points[j][0]
            var y1 = points[j][1]

            var dist = Math.sqrt(Math.pow((x1-x),2) + Math.pow((y1-y),2))

            if(dist < leastDist || leastDist == -1){
                leastDist = dist
                point = j
            }
        }
        closestPoint.push(point)
    }

    console.log('Finished finding closest neighbor')
    console.log('beginning clustering')

    var clusterNum = 0
    var clusters = []
    var refdict = {}

    for(var i = 0; i < closestPoint.length; i++){

        if(!(closestPoint[i] in refdict)){
            clusters.push([closestPoint[i]])
            refdict[closestPoint[i]] = clusterNum
            clusterNum++
        }

        if(i in refdict){
            if(refdict[i] != refdict[closestPoint[i]]){
                var tempi = refdict[i] //will be changed by loop, and need it for clusters
                var tempcpi = refdict[closestPoint[i]]
                var cluster = clusters[tempi]

                for(var j = 0; j < cluster.length; j++){
                    clusters[tempcpi].push(cluster[j])
                    refdict[cluster[j]] = tempcpi
                }
                
                clusters[tempi] = []
            }
        }
        else{
            refdict[i] = refdict[closestPoint[i]]
            clusters[refdict[closestPoint[i]]].push(i)
        }
    }

    var cn_return = []
    var clusters = clusters.sort(function(a, b){
        return b.length - a.length
    })

    for(var i = 0; i < clusters.length; i++){
        if(cn_return.length == clusterCount)
            break;
        else if(clusters[i].length != 0)
            cn_return.push(clusters[i])
    }

    return cn_return
}

//example call:
//var clusters = cn([[1,2],[3,8],[4,2],[0,3],[1,1],[6,7],[1,3],[1,2],[2,10]],2)
//console.log(clusters)