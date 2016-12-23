// from @mrdoob http://www.mrdoob.com/lab/javascript/webgl/city/01/

var THREEx = THREEx || {}

THREEx.ProceduralCity	= function(renderer){
	// build the base geometry for each building
	var geometry = new THREE.CubeGeometry( 1, 1, 1 );
	// translate the geometry to place the pivot point at the bottom instead of the center
	geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0.5, 0 ) );
	// get rid of the bottom face - it is never seen
	geometry.faces.splice( 6, 2 );
	geometry.faceVertexUvs[0].splice( 6, 2 );
	for(var i = 4;i<6;i++){
	geometry.faceVertexUvs[0][i][0].y=0;
	geometry.faceVertexUvs[0][i][2].y=0;
}
	// geometry.faceVertexUvs[0][5][2].y=0;
	// buildMesh
	var buildingMesh= new THREE.Mesh( geometry );

	// base colors for vertexColors. light is for vertices at the top, shaddow is for the ones at the bottom
	var light	= new THREE.Color( 0xffffff )
	var shadow	= new THREE.Color( 0x303050 )

	var cityGeometry= new THREE.Geometry();
	for( var i = 0; i < 2000; i ++ ){
		// put a random position
		buildingMesh.position.x	= Math.floor( Math.random() * 200 - 100 ) * 4;
		buildingMesh.position.z	= Math.floor( Math.random() * 200 - 100 ) * 4;
		// put a random rotation
		var h = (Math.random() * Math.random() * Math.random() * buildingMesh.scale.x) * 6 + 6;
		// console.log(h);
		if(h>30){
			buildingMesh.rotation.y	= Math.random()*Math.PI*2;
		} else {
			buildingMesh.rotation.y	=0;
		}
		// put a random scale
		buildingMesh.scale.x	= Math.random() * Math.random() * Math.random() * Math.random() * 50 + 10;
		buildingMesh.scale.y	= h;
		buildingMesh.scale.z	= buildingMesh.scale.x

		// establish the base color for the buildingMesh
		var value	= 1 - Math.random() * Math.random()*0.1;
		var baseColor	= new THREE.Color().setRGB( value + Math.random() * 0.1, value, value + Math.random() * 0.1 );
		// set topColor/bottom vertexColors as adjustement of baseColor
		var topColor	= baseColor.clone().multiply( light );
		var bottomColor	= baseColor.clone().multiply( shadow );
		// set .vertexColors for each face
		var geometry	= buildingMesh.geometry;	
		for ( var j = 0, jl = geometry.faces.length; j < jl; j ++ ) {
			if ( j === 4 || j ===5) {
				// set face.vertexColors on root face
				geometry.faces[ j ].vertexColors = [ baseColor, baseColor, baseColor ];
			} else if(j%2 ===0) {
				geometry.faces[ j ].vertexColors = [ baseColor, bottomColor, baseColor];
			} else {
				geometry.faces[ j ].vertexColors = [ bottomColor, bottomColor, baseColor];
			}
		}
		// merge it with cityGeometry - very important for performance
		buildingMesh.updateMatrix();
		cityGeometry.merge(buildingMesh.geometry,buildingMesh.matrix );
	}

	// generate the texture
	var texture		= new THREE.Texture( generateTextureCanvas() );
	texture.anisotropy	= renderer.getMaxAnisotropy();
	texture.needsUpdate	= true;

	// build the mesh
	var material	= new THREE.MeshLambertMaterial({
		map		: texture,
		vertexColors	: THREE.VertexColors
	});
	var mesh = new THREE.Mesh(cityGeometry, material );
	return mesh

	function generateTextureCanvas(){
		// build a small canvas 32x64 and paint it in white
		var canvas	= document.createElement( 'canvas' );
		canvas.width	= 32;
		canvas.height	= 64;
		var context	= canvas.getContext( '2d' );
		// plain it in white
		context.fillStyle	= '#000000';
		context.fillRect( 0, 0, 32, 64 );
		// draw the window rows - with a small noise to simulate light variations in each room
		for( var y = 2; y < 64; y += Math.floor( 3 + Math.random()*2 ) ){
			for( var x = 0; x < 32; x += 2 ){
				var value	= Math.floor( Math.random() * 64 );
				context.fillStyle = 'rgb(' + [value, value, value].join( ',' )  + ')';
				context.fillRect( x, y, 2, 2 );
			}
		}

		// build a bigger canvas and copy the small one in it
		// This is a trick to upscale the texture without filtering
		var canvas2	= document.createElement( 'canvas' );
		canvas2.width	= 512;
		canvas2.height	= 1024;
		var context	= canvas2.getContext( '2d' );
		// disable smoothing
		context.imageSmoothingEnabled		= false;
		context.webkitImageSmoothingEnabled	= false;
		context.mozImageSmoothingEnabled	= false;
		// then draw the image
		context.drawImage( canvas, 0, 0, canvas2.width, canvas2.height );
		// return the just built canvas2
		return canvas2;
	}
}