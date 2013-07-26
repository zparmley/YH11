var FOG_ENABLED = false;

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
var first_piece;
var next_piece;
var last_piece;

// Whale config
var default_next_animate_delay = 20;
var default_x = 0;
var default_y = 125;
var start_z = -1000;
var default_z_move = 10;

// Sizes, length
var body_max_radius = 180;
var front_min_radius = 40;
var front_num_pieces = 14;
var body_num_pieces = 7;
var tail_min_radius = 20;
var tail_max_y_offset = -300;
var tail_num_pieces = 18;

var WATER_COLOR = 0xaaccff;

var eye_stack_position = 3;
var eye_radius = 10;
var eye_x_offset = 50;
var eye_y_offset = 50;

init();
animate();

function range_slope(start, end, num) {
    init_range = _.range(0, end-start);
    ret_range = [];
    mod_point = Math.ceil((end-start)/num);
    for (var i = 0; i<init_range.length; i++) {
        if (init_range[i] % mod_point == 0) {
            ret_range.push(init_range[i] + start);
        }
    }

    while (ret_range.length < num) {
        ret_range.push(end);
    }

    return ret_range;
}



function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    halfWidth = window.innerWidth / 2;
    halfHeight = window.innerHeight / 2;
    //camera = new THREE.OrthographicCamera(-halfWidth, halfWidth, halfHeight, -halfHeight, 1, 5000);
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1100 );
    camera.position.set( 0, 0, -1);

    scene = new THREE.Scene();

    if (FOG_ENABLED) {
        fog = new THREE.Fog(WATER_COLOR, 600, 1000);
        scene.fog = fog;
    }

    parent = new THREE.Object3D();
    scene.add( parent );

    function addShape( circleGeom, color, x, y, z, rx, ry, rz, s ) {
        var texture = THREE.ImageUtils.loadTexture('textures/whale_colors_2.png');
        texture.offset.x = 0.05;
        texture.offset.y = 0.05;
        texture.repeat.x = 0.9;
        texture.repeat.y = 0.9;

    	var material = new THREE.MeshBasicMaterial( { map: texture} );
    	var mesh = new THREE.Mesh( circleGeom, material );
    	mesh.position.set( x, y, z );
    	mesh.rotation.set( rx, ry, rz );
    	mesh.scale.set( s, s, s );
        console.log(mesh);
    	parent.add( mesh );
    }

    function makeWhalePiece(shape, color, x, y, z, next_shape, next_animate_delay, xoffset, yoffset) {
        addShape(shape, color, x, y, z, 0, 0, 0, 1);
        return {
            x: x,
            y: y,
            z: z,
            shape: shape,
            position_in_scene: scene.children[0].children.length - 1,
            next_shape: next_shape,
            next_animate_delay: next_animate_delay,
            xoffset: xoffset | 0,
            yoffset: yoffset | 0,
            siblings: null
        };
    }

    function makeOffsetWhaleCircle(radius, color, z, x_offset, y_offset, next_shape) {
        return makeWhalePiece(makeCircle(radius), color, default_x + x_offset, default_y + y_offset, z, next_shape, default_next_animate_delay, x_offset, y_offset);
    }
    function makeBasicWhaleCircle(radius, color, z, next_shape) {
        return makeWhalePiece(makeCircle(radius), color, default_x, default_y, z, next_shape, default_next_animate_delay, 0, 0);
    }

    function makeCircle( radius ) {
        return new THREE.CircleGeometry(radius, 32);
    }

    var current_color = 0xffffff;
    function altColor() {
        if (current_color == 0x000000) {
            current_color = 0xffffff;
        } else {
            current_color = 0x000000;
        }
        console.log(current_color);
        return current_color;
    }

    var current_z = start_z;
    function get_z(z_move) {
        ret = current_z;
        z_move = z_move | default_z_move;
        current_z = current_z + default_z_move;
        return ret;
    }

        //     function makeOffsetWhaleCircle(radius, color, z, x_offset, y_offset, next_shape)
    function process_pieces_stack_piece(piece_def, next) {
        if (piece_def[0] == 'basic') {
            piece = makeBasicWhaleCircle(piece_def[1], piece_def[2], piece_def[3], next);
        } else if (piece_def[0] == 'offset') {
            piece = makeOffsetWhaleCircle(piece_def[1], piece_def[2], piece_def[3], piece_def[4], piece_def[5], next);
        }

        return piece;
    }

    function process_pieces_stack(stack) {
        piece = null;
        var processed_stack = [];
        for (var i=0; i<stack.length; i++) {
            piece = process_pieces_stack_piece(stack[i], piece);
            processed_stack.push(piece);
        }
        last_piece = piece;
        return processed_stack;
    }

    function add_siblings(piece, sibling_stack) {
        piece.siblings = [];
        for (var i = 0; i < sibling_stack.length; i++) {
            piece.siblings.push(process_pieces_stack_piece(sibling_stack[i]))
        }
    }

    function add_whale() {
        var whale_pieces_stack = [];

        // Backside/tail slope
        var backside_radius = range_slope(tail_min_radius, body_max_radius, tail_num_pieces);
        var backside_y_push = range_slope(tail_max_y_offset, 0, tail_num_pieces);
        _.zip(backside_radius, backside_y_push).map(function(radius_yoffset) {
            whale_pieces_stack.push(['offset', radius_yoffset[0], altColor(), get_z(), 0, radius_yoffset[1]]);
        });

        // Mid length
        for (var i = 0; i < body_num_pieces; i++) {
            whale_pieces_stack.push(['basic', body_max_radius, altColor(), get_z()]);
        }
        // From max diameter to front
        var frontside_radius = range_slope(front_min_radius, body_max_radius, front_num_pieces).reverse();
        frontside_radius.map(function(radius) {
            whale_pieces_stack.push(['basic', radius, altColor(), get_z()]);
        });

        var processed_stack = process_pieces_stack(whale_pieces_stack);

        // Main stack complete - add more pylons
        var eye_z = processed_stack[processed_stack.length - eye_stack_position].z;
        eye_stack = [
            ['offset', eye_radius, 0x000000, eye_z, -eye_x_offset, eye_y_offset],
            ['offset', eye_radius, 0x000000, eye_z, eye_x_offset, eye_y_offset]
        ];

        add_siblings(processed_stack[processed_stack.length-3], eye_stack);
   }

    add_whale();


    renderer = new THREE.WebGLRenderer( { antialias: true } );
    // renderer = new THREE.CanvasRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.sortObjects = false;
    renderer.sortElements = false;
    container.appendChild( renderer.domElement );

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    // document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    document.addEventListener( 'touchmove', onDocumentTouchMove, false );

    window.addEventListener( 'resize', onWindowResize, false );

}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
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
    goToMouse(event);

    // mouseX = event.clientX - windowHalfX;
    // mouseY = event.clientY - windowHalfY;

    // targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;

}


function animateThing( fromx, fromy, tox, toy, thingIndex, duration, easing, delay ) {
    setTimeout(function() {
    $({targetX: fromx, targetY: fromy}).animate({targetX: tox, targetY: toy}, {
        duration: duration,
        easing: 'easeOutCubpic',
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
    if (piece.siblings != null) {
        for (var i = 0; i < piece.siblings.length; i++) {
            animateWhalePiece(piece.siblings[i], tox, toy);
        }
    }
    if (piece.next_shape != null) {
        setTimeout(function() {
            animateWhalePiece(piece.next_shape, tox, toy);
        }, piece.next_animate_delay);
    }

}

var gtmcallcount = 0;
function goToMouseInner( event ) {
    gtmcallcount++;
    console.log(gtmcallcount);

    mouseX = event.clientX - windowHalfX;
    mouseY = -(event.clientY - windowHalfY);
    animateWhalePiece(last_piece, mouseX, mouseY);
}

goToMouse = _.throttle(goToMouseInner, 125);

function onDocumentMouseUp( event ) {
    document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

    mouseX = event.clientX - windowHalfX;
    mouseY = -(event.clientY - windowHalfY);
    animateWhalePiece(last_piece, mouseX, mouseY);
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
    stats.update();
}


function render() {
    renderer.render( scene, camera );
}
