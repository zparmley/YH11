var container, stats;

var camera, scene, renderer;

var text, plane;

var targetRotation = 0;
var targetRotationOnMouseDown = 0;

var mouseX = 0;
var mouseXOnMouseDown = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init();
animate();

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 0, 150, 500 );

    scene = new THREE.Scene();

    parent = new THREE.Object3D();
    parent.position.y = 50;
    scene.add( parent );

    function addShape( shape, color, x, y, z, rx, ry, rz, s ) {

	// flat shape

	var geometry = new THREE.ShapeGeometry( shape );
	var material = new THREE.MeshBasicMaterial( { color: color, overdraw: true } );

	var mesh = new THREE.Mesh( geometry, material );
	mesh.position.set( x, y, z );
	mesh.rotation.set( rx, ry, rz );
	mesh.scale.set( s, s, s );
	parent.add( mesh );

	// line

	var geometry = shape.createPointsGeometry();
	var material = new THREE.LineBasicMaterial( { linewidth: 2, color: 0x333333, transparent: true } );

	var line = new THREE.Line( geometry, material );
	line.position.set( x, y, z );
	line.rotation.set( rx, ry, rz );
	line.scale.set( s, s, s );
	parent.add( line );

    }

    function makeCircle( radius ) {
	var circleShape = new THREE.Shape();
	circleShape.moveTo( 0, radius );
	circleShape.quadraticCurveTo( radius, radius, radius, 0 );
	circleShape.quadraticCurveTo( radius, -radius, 0, -radius );
	circleShape.quadraticCurveTo( -radius, -radius, -radius, 0 );
	circleShape.quadraticCurveTo( -radius, radius, 0, radius );
	return circleShape
    }




    // Triangle

    var triangleShape = new THREE.Shape();
    triangleShape.moveTo(  80, 20 );
    triangleShape.lineTo(  40, 80 );
    triangleShape.lineTo( 120, 80 );
    triangleShape.lineTo(  80, 20 ); // close path




    // Square

    var sqLength = 80;

    var squareShape = new THREE.Shape();
    squareShape.moveTo( 0,0 );
    squareShape.lineTo( 0, sqLength );
    squareShape.lineTo( sqLength, sqLength );
    squareShape.lineTo( sqLength, 0 );
    squareShape.lineTo( 0, 0 );



    // Arc circle

    var arcShape = new THREE.Shape();
    arcShape.moveTo( 50, 10 );
    arcShape.absarc( 10, 10, 40, 0, Math.PI*2, false );

    var holePath = new THREE.Path();
    holePath.moveTo( 20, 10 );
    holePath.absarc( 10, 10, 10, 0, Math.PI*2, true );
    arcShape.holes.push( holePath );


    // Smiley

    var smileyShape = new THREE.Shape();
    smileyShape.moveTo( 80, 40 );
    smileyShape.absarc( 40, 40, 40, 0, Math.PI*2, false );

    var smileyEye1Path = new THREE.Path();
    smileyEye1Path.moveTo( 35, 20 );
    // smileyEye1Path.absarc( 25, 20, 10, 0, Math.PI*2, true );
    smileyEye1Path.absellipse( 25, 20, 10, 10, 0, Math.PI*2, true );

    smileyShape.holes.push( smileyEye1Path );

    var smileyEye2Path = new THREE.Path();
    smileyEye2Path.moveTo( 65, 20 );
    smileyEye2Path.absarc( 55, 20, 10, 0, Math.PI*2, true );
    smileyShape.holes.push( smileyEye2Path );

    var smileyMouthPath = new THREE.Path();
    // ugly box mouth
    // smileyMouthPath.moveTo( 20, 40 );
    // smileyMouthPath.lineTo( 60, 40 );
    // smileyMouthPath.lineTo( 60, 60 );
    // smileyMouthPath.lineTo( 20, 60 );
    // smileyMouthPath.lineTo( 20, 40 );

    smileyMouthPath.moveTo( 20, 40 );
    smileyMouthPath.quadraticCurveTo( 40, 60, 60, 40 );
    smileyMouthPath.bezierCurveTo( 70, 45, 70, 50, 60, 60 );
    smileyMouthPath.quadraticCurveTo( 40, 80, 20, 60 );
    smileyMouthPath.quadraticCurveTo( 5, 50, 20, 40 );

    smileyShape.holes.push( smileyMouthPath );


    // Spline shape + path extrusion

    var splinepts = [];
    splinepts.push( new THREE.Vector2 ( 350, 100 ) );
    splinepts.push( new THREE.Vector2 ( 400, 450 ) );
    splinepts.push( new THREE.Vector2 ( -140, 350 ) );
    splinepts.push( new THREE.Vector2 ( 0, 0 ) );

    var splineShape = new THREE.Shape(  );
    splineShape.moveTo( 0, 0 );
    splineShape.splineThru( splinepts );


    // addShape( shape, color, x, y, z, rx, ry,rz, s );
    addShape( makeCircle(40), 0xff0011, 0, 125, -160, 0, 0, 0, 1 );
    addShape( makeCircle(60), 0x00ff11, 0, 125, -100, 0, 0, 0, 1 );
    addShape( makeCircle(80), 0x1100ff, 0, 125, -40, 0, 0, 0, 1 );
    addShape( makeCircle(60), 0x00ff11, 0, 125, 0, 0, 0, 0, 1 );
    addShape( smileyShape,    0xff0011, -40, 85, 40, 0, 0, 0, 1 );
    // addShape( makeCircle(40), 0xff0011, 0, 125, 40, 0, 0, 0, 1 );



    //

    renderer = new THREE.CanvasRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.sortObjects = false;
    renderer.sortElements = false;
    container.appendChild( renderer.domElement );


    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    document.addEventListener( 'touchmove', onDocumentTouchMove, false );

    //

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function onDocumentMouseDown( event ) {

    event.preventDefault();

    // document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mouseup', onDocumentMouseUp, false );
    // document.addEventListener( 'mouseout', onDocumentMouseOut, false );

    mouseXOnMouseDown = event.clientX - windowHalfX;
    mouseYOnMouseDown = event.clientY - windowHalfY;
    targetRotationOnMouseDown = targetRotation;

}

function onDocumentMouseMove( event ) {

    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;

    targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;

}

function animateThing( fromx, fromy, tox, toy, thingIndex, duration, easing, delay ) {
    setTimeout(function() {
	$({targetX: fromx, targetY: fromy}).animate({targetX: tox, targetY: toy}, {
	    duration: duration,
	    easing: 'easeOutCubic',
	    step: function() {
		scene.children[0].children[thingIndex].position.x = this.targetX;
		scene.children[0].children[thingIndex].position.y = this.targetY;
	    }
	});
    }, delay);

}

function onDocumentMouseUp( event ) {

    document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

    currentX = scene.children[0].children[0].position.x
    currentY = scene.children[0].children[0].position.y
    mouseX = event.clientX - windowHalfX;
    mouseY = -(event.clientY - windowHalfY);
    // function animateThing( fromx, fromy, tox, toy, thingIndex, duration, easing, delay ) {
    animateThing(currentX, currentY, mouseX, mouseY, 0, 700, 'easeOutCubic', 400);
    animateThing(currentX, currentY, mouseX, mouseY, 1, 700, 'easeOutCubic', 400);
    animateThing(currentX, currentY, mouseX, mouseY, 2, 700, 'easeOutCubic', 300);
    animateThing(currentX, currentY, mouseX, mouseY, 3, 700, 'easeOutCubic', 300);
    animateThing(currentX, currentY, mouseX, mouseY, 4, 700, 'easeOutCubic', 200);
    animateThing(currentX, currentY, mouseX, mouseY, 5, 700, 'easeOutCubic', 200);
    animateThing(currentX, currentY, mouseX, mouseY, 6, 700, 'easeOutCubic', 100);
    animateThing(currentX, currentY, mouseX, mouseY, 7, 700, 'easeOutCubic', 100);
    animateThing(currentX, currentY - 40, mouseX - 40, mouseY - 40, 8, 700, 'easeOutCubic', 0);
    animateThing(currentX, currentY - 40, mouseX - 40, mouseY - 40, 9, 700, 'easeOutCubic', 0);


}

function onDocumentMouseOut( event ) {

    document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

}

function onDocumentTouchStart( event ) {

    if ( event.touches.length == 1 ) {

	event.preventDefault();

	mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
	targetRotationOnMouseDown = targetRotation;

    }

}

function onDocumentTouchMove( event ) {

    if ( event.touches.length == 1 ) {

	event.preventDefault();

	mouseX = event.touches[ 0 ].pageX - windowHalfX;
	targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;

    }

}

//

function animate() {

    requestAnimationFrame( animate );

    render();

}

function render() {

    parent.rotation.y += ( targetRotation - parent.rotation.y ) * 0.05;
    renderer.render( scene, camera );

}
