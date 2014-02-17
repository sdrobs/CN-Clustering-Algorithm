//assuming points entered as array of 2 element arrays (eg. [[1,2],[5,6]])

function cn(points, clusterCount){ //clusterCount is the number of clusters to restrict the plot to
    var closestPoint = []
    var plotsize = -1

    for(var i = 0; i < points.length; i++){ //need plotsize for quadtree
        if(points[i][0] > plotsize)
            plotsize = points[i][0]
        if(points[i][1] > plotsize)
            plotsize = points[i][1]
    }

    var qtree = new quadtree(points,0,0,plotsize+1,plotsize+1) //+1 to avoid edge cases

    for(var i = 0; i < points.length; i++){
        closestPoint.push(qtree.findNearestPoint(points[i])[2])
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

function quadtree(points,x,y,x1,y1){
    for(var i = 0; i < points.length; i++){ //for nn position
        points[i].push(i)
    }

    this.points = points
    this.x = x
    this.y = y
    this.x1 = x1
    this.y1 = y1
    this.tree = {}

    qt_recurse(this.points,this.tree,this.x,this.y,this.x1,this.y1)

    function qt_recurse(points,context,x,y,x1,y1){
        context.x = x
        context.y = y
        context.x1 = x1
        context.y1 = y1

        if(points.length == 1){
            context.points = points
            return
        }

        var equal = true
        for(var i = 1; i < points.length; i++){
            if(String(points[i][0]) !== String(points[0][0]) || String(points[1][1]) !== String(points[i][1]) ){
                equal = false
                break
            }
        }

        if(equal){
            context.points = points
            return
        }

        context[0] = {}
        context[1] = {}
        context[2] = {}
        context[3] = {}

        var points0 = []
        var points1 = []
        var points2 = []
        var points3 = []

        for(var i = 0; i < points.length; i++){
            var point = points[i]

            if(point[0] < (x+x1)/2){
                if(point[1] < (y+y1)/2){
                    points0.push(point)
                }
                else{
                    points2.push(point)
                }
            }
            else{
                if(point[1] < (y+y1)/2){
                    points1.push(point)
                }
                else{
                    points3.push(point)
                }
            }
        }

        if(points0.length > 0){
            qt_recurse(points0,context[0],x,y,(x+x1)/2,(y+y1)/2)
        }
        if(points1.length > 0){
            qt_recurse(points1,context[1],(x+x1)/2,y,x1,(y+y1)/2)
        }
        if(points2.length > 0){
            qt_recurse(points2,context[2],x,(y+y1)/2,(x+x1)/2,y1)
        }
        if(points3.length > 0){
            qt_recurse(points3,context[3],(x+x1)/2,(y+y1)/2,x1,y1)
        }
    }
}

quadtree.prototype.findNearestPoint = function(point,radius){
    var r = radius || Math.max(this.x1,this.y1)
    var closest = []
    var closestDist = -1
    
    nn(this.tree,point)
    return closest

    function nn(ctx,pt){
        if(ctx.points){
            for(var i = 0; i<ctx.points.length; i++){
                var p1 = ctx.points[i]
                if(String(p1) == String(pt))
                    continue
                var dist = Math.sqrt(Math.pow((p1[0]-pt[0]),2) + Math.pow((p1[1] - pt[1]),2))
                if(dist < closestDist || closestDist == -1){
                    closestDist = dist
                    closest = p1
                }
            }
        }

        if(0 in ctx){ //therefore 0,1,2,3
            if('x' in ctx[0]){ //therefore y,x1,y1
                if(inRadius(ctx[0].x,ctx[0].y,ctx[0].x1,ctx[0].y1,pt,r)){
                    nn(ctx[0],pt)
                }
            }
            if('x' in ctx[1]){
                if(inRadius(ctx[1].x,ctx[1].y,ctx[1].x1,ctx[1].y1,pt,r)){
                    nn(ctx[1],pt)
                }
            }
            if('x' in ctx[2]){
                if(inRadius(ctx[2].x,ctx[2].y,ctx[2].x1,ctx[2].y1,pt,r)){
                    nn(ctx[2],pt)
                }
            }
            if('x' in ctx[3]){
                if(inRadius(ctx[3].x,ctx[3].y,ctx[3].x1,ctx[3].y1,pt,r)){
                    nn(ctx[3],pt)
                }
            }
        }

        function inRadius(x,y,x1,y1,pt,r){ //will be 9
            var isIn = true
            var distance //from point to region

            if(pt[0] < x && pt[1] < y){
                distance = Math.sqrt(Math.pow((x-pt[0]),2) + Math.pow((y-pt[1]),2))
                //to x,y
            }
            if(pt[0] > x && pt[0] < x1){
                if(pt[1] < y){
                    distance = y-pt[1]
                }
                if(pt[1] > y && pt[1] < y1){
                    return isIn
                    //isIn = true (center of square)
                }
                if(pt[1] > y1){
                    distance = pt[1] - y1
                }
            }
            if(pt[0] > x1 && pt[1] < y){
                distance = Math.sqrt(Math.pow((x1-pt[0]),2) + Math.pow((y-pt[1]),2))
                //to x1,y
            }
            if(pt[1] > y && pt[1] < y1){
                if(pt[0] > x1){
                    distance = pt[0] - x1
                }
                if(pt[0] < x){
                    distance = x - pt[0]
                }
            }
            if(pt[0] > x1 && pt[1] > y1){
                distance = Math.sqrt(Math.pow((x1-pt[0]),2) + Math.pow((y1-pt[1]),2))
                //to x1,y1
            }
            if(pt[0] < x && pt[1] > y1){
                distance = Math.sqrt(Math.pow((x-pt[0]),2) + Math.pow((y1-pt[1]),2))
                //to x,y1
            }

            if(distance > r)
                isIn = false

            return isIn
        }
    }
}

//example call:
//var clusters = cn([[1,2],[3,8],[4,2],[0,3],[1,1],[6,7],[1,3],[1,2],[2,10]],2)
//console.log(clusters)