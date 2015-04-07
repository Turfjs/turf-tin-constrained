var 
	fc = require('turf-featurecollection'),
	pol = require('turf-polygon'),
	poly2tri = require('poly2tri');

/**
*	turf.constrainedtin
*	Function that process a {@link Polygon} and make a tin constrained to it
* @requires	http://r3mi.github.io/poly2tri.js/dist/poly2tri.js
* @param {Feature<(Polygon)>} poly - single Polygon Feature
* @param {[Feature<(Point)>]} steinerpoints - Array of Steiner Point features: {@linkhttp://www.iue.tuwien.ac.at/phd/fleischmann/node54.html|Steiner Points and Steiner Triangulation} 
* @return {FeatureCollection<(Polygon)>}, triangle.properties.constrained_edge = [boolean] which index is the same as the opposite vertex
* @author	Abel Vázquez
* @version 1.1.0
*/
module.exports = function(poly, steinerpoints){
	
	if (poly.geometry === void 0 || poly.geometry.type !== 'Polygon' ) throw('"turf-tin-constrained" only accepts polygon type input');
	
	var	
			spoints = (steinerpoints!= void 0)? steinerpoints.map(function(p){
					var pp = (p.geometry!=void 0)? p.geometry.coordinates : p;
					return new poly2tri.Point(pp[0], pp[1]);
				}) : [],
			triangles,
			ctx =  poly.geometry.coordinates.map(function(a){
				var c = a.map(function(b){
					return new poly2tri.Point(b[0], b[1])
					});
				c.pop();
				return c;
				}),
			contour = ctx.shift(),
			swctx,
			features;
	try{
		swctx = new poly2tri.SweepContext(contour, {cloneArrays: true});
        swctx.addHoles(ctx).addPoints(spoints);
        swctx.triangulate();
	}catch(e){
		console.log(e);
		return -1;
	}

	triangles = swctx.getTriangles() || [];
	
	features = triangles.map(function(t){
		var 
			points =[], 
			cell;
		 t.getPoints().forEach(function(p) {
			points.push([p.x, p.y]);
		});
		points.push([t.getPoint(0).x, t.getPoint(0).y])
		cell = pol([points])
		cell.properties.constrained_edge = t.constrained_edge;
		return cell;
	});
	
	return fc(features);
	
}
