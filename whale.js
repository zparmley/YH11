var container, stats;

var camera, scene, renderer;

var text, plane;

var targetRotation = 0;
var targetRotationOnMouseDown = 0;

var mouseX = 0;
var mouseXOnMouseDown = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;


// Some global stuff - ouch - refactor
var first_piece
var next_piece
var last_piece



init();
animate();

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

//    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
    halfWidth = window.innerWidth / 2;
    halfHeight = window.innerHeight / 2;
    camera = new THREE.OrthographicCamera(-halfWidth, halfWidth, halfHeight, -halfHeight, 1, 1000);
    camera.position.set( 0, 0, -1);

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

    	// var geometry = shape.createPointsGeometry();
    	// var material = new THREE.LineBasicMaterial( { linewidth: 2, color: 0x333333, transparent: true } );

    	// var line = new THREE.Line( geometry, material );
    	// line.position.set( x, y, z );
    	// line.rotation.set( rx, ry, rz );
    	// line.scale.set( s, s, s );
    	// parent.add( line );

    }

    function makeWhalePiece(shape, color, x, y, z, next_shape, next_animate_delay, xoffset, yoffset) {
        addShape(shape, color, x, y, z, 0, 0, 0, 1);
        return {
            shape: shape,
            position_in_scene: scene.children[0].children.length - 1,
            next_shape: next_shape,
            next_animate_delay: next_animate_delay,
            xoffset: xoffset | 0,
            yoffset: yoffset | 0
        };
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

    // addShape( shape, color, x, y, z, rx, ry,rz, s );
    // function makeWhalePiece(shape, color, x, y, z, next_shape, next_animate_delay, xoffset, yoffset) {
    rcolor = parseInt('0x' + Math.floor(Math.random()*16777215).toString(16));
    first_piece = makeWhalePiece(makeCircle(30), rcolor, 0, 125, -180, null, null, 0, 0);
    rcolor = parseInt('0x' + Math.floor(Math.random()*16777215).toString(16));
    next_piece = makeWhalePiece(makeCircle(40), rcolor, 0, 125, -160, first_piece, 10, 0, 0);
    rcolor = parseInt('0x' + Math.floor(Math.random()*16777215).toString(16));
    piece = makeWhalePiece(makeCircle(60), rcolor, 0, 125, -140, next_piece, 10, 0, 0);
    for (var i = 1; i < 500; i++) {
        rcolor = parseInt('0x' + Math.floor(Math.random()*16777215).toString(16));
        piece = makeWhalePiece(makeCircle(80), rcolor, 0, 125, -140 + (i/5), piece, 5, 0, 0);
    }
    last_piece = piece;

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    // renderer = new THREE.CanvasRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.sortObjects = false;
    renderer.sortElements = false;
    container.appendChild( renderer.domElement );

    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    document.addEventListener( 'touchmove', onDocumentTouchMove, false );

    window.addEventListener( 'resize', onWindowResize, false );

}


function onWindowResize() {

    halfWidth = window.innerWidth / 2;
    halfHeight = window.innerHeight / 2;
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;

    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}


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

function animateThingNoDelay( fromx, fromy, tox, toy, thingIndex, duration, easing) {
    $({targetX: fromx, targetY: fromy}).animate({targetX: tox, targetY: toy}, {
        duration: duration,
        easing: 'easeOutCubic',
        step: function() {
            scene.children[0].children[thingIndex].position.x = this.targetX;
            scene.children[0].children[thingIndex].position.y = this.targetY;
        }
    });
}


function animateWhalePiece(piece, tox, toy) {
    fromx = scene.children[0].children[piece.position_in_scene].position.x;
    fromy = scene.children[0].children[piece.position_in_scene].position.y;
    animateThingNoDelay(fromx, fromy, tox + piece.xoffset, toy + piece.yoffset, piece.position_in_scene, 700, 'swing');
    if (piece.next_shape != null) {
        setTimeout(function() {
            animateWhalePiece(piece.next_shape, tox, toy);
        }, piece.next_animate_delay);
    }

}


function onDocumentMouseUp( event ) {
    document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

    currentX = scene.children[0].children[0].position.x
    currentY = scene.children[0].children[0].position.y
    mouseX = event.clientX - windowHalfX;
    mouseY = -(event.clientY - windowHalfY);
    animateWhalePiece(last_piece, mouseX, mouseY);
    // function animateThing( fromx, fromy, tox, toy, thingIndex, duration, easing, delay ) {
    // animateThing(currentX, currentY, mouseX, mouseY, 0, 700, 'easeOutCubic', 400);
    // animateThing(currentX, currentY, mouseX, mouseY, 1, 700, 'easeOutCubic', 400);
    // animateThing(currentX, currentY, mouseX, mouseY, 2, 700, 'easeOutCubic', 300);
    // animateThing(currentX, currentY, mouseX, mouseY, 3, 700, 'easeOutCubic', 300);
    // animateThing(currentX, currentY, mouseX, mouseY, 4, 700, 'easeOutCubic', 200);
    // animateThing(currentX, currentY, mouseX, mouseY, 5, 700, 'easeOutCubic', 200);
    // animateThing(currentX, currentY, mouseX, mouseY, 6, 700, 'easeOutCubic', 100);
    // animateThing(currentX, currentY, mouseX, mouseY, 7, 700, 'easeOutCubic', 100);
    // animateThing(currentX, currentY - 40, mouseX - 40, mouseY - 40, 8, 700, 'easeOutCubic', 0);
    // animateThing(currentX, currentY - 40, mouseX - 40, mouseY - 40, 9, 700, 'easeOutCubic', 0);
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


function animate() {

    requestAnimationFrame( animate );

    render();

}


function render() {

    parent.rotation.y += ( targetRotation - parent.rotation.y ) * 0.05;
    renderer.render( scene, camera );

}
