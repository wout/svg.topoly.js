// svg.topoly.js 0.1.0 - Copyright (c) 2014 Wout Fierens - Licensed under the MIT license

;(function() {

  SVG.extend(SVG.PathArray, {
    // Convert path to poly
    toPoly: function(sample) {
      var total, point, distance
        , length = 0
        , points = []
				, segments;

      // parse sample value
      sample = new SVG.Number(sample || '1%');
      // render data
      SVG.parser.path.setAttribute('d', this.toString())
      // get total length
      total = SVG.parser.path.getTotalLength()
			
      // calculate sample distance
			if(sample.unit === '%') {
					distance = total * sample.value; // sample distance in %
			} else if (sample.unit === 'px') {
				sample.value; // fixed sample distance in px
			} else {
				total / sample.value; // specific number of samples
			}
			
			segments = this.value;
			
			var addPoint = function(x,y) {
				var lastPoint = points[points.length-1];
				// When the last point doesn't equal the current point add the current point
				if (!lastPoint || x!=lastPoint[0] || y!=lastPoint[1]) {
					points.push([x,y]);
				}
			}
			var addSegmentPoint = function(segment){
				var x, y, type = segment[0];
				if(type === "Z") return;
				switch(type) {
					case "M":
					case "L":
					case "T":
						x = segment[1];
						y = segment[2];
						break;
					case "H":
						x = segment[1];
						break;
					case "V":
						y = segment[1];
						break;
					case "C":
						x = segment[5];
						y = segment[6];
						break;
					case "S":
					case "Q":	
						x = segment[3];
						y = segment[4];
						break;
				}
				addPoint(x,y);
			}
		
      // sample through path
			var lastSegment, segmentIndex;
      while (length < total) {
				segmentIndex = SVG.parser.path.getPathSegAtLength(length);
				var segment = segments[segmentIndex];
				// new segment? 
				if (segment != lastSegment){
					// add the segment we just left
					if(lastSegment !== undefined)	addSegmentPoint(lastSegment);
					lastSegment = segment;
				}
	
				// Add points in between when curving
				switch(segment[0]) {
						case "C":
						case "T":
						case "S":
						case "Q":	
							point = SVG.parser.path.getPointAtLength(length);
							addPoint(point.x,point.y);
							break;
				}
        
        // increment by sample value
        length += distance;
      }
			
			// add remaining segments we didn't pass while sampling
			for (var i=segmentIndex,len=segments.length;i<len;++i) {
				addSegmentPoint(segments[i]);
			}
  		
      // send out as point array
      return new SVG.PointArray(points)
    }

  })

  SVG.extend(SVG.Path, {
    // Convert path to poly*
    toPoly: function(sample, replace) {
      var poly, type

      // define type
      type = /z\s*$/i.test(this.attr('d')) ? 'polygon' : 'polyline'
			
      // create poly*
      poly = this.parent[type](this.array.toPoly(sample))

      // insert after myself
      this.after(poly)

      // remove myslef if replacement is required
      if (replace)
        this.remove()

      return poly
    }
  })

}).call(this)